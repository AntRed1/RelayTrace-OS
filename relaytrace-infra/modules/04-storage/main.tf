# ══════════════════════════════════════════════════════════════════════════════
# Module: 04-storage
#
# Provisions the Azure Storage Account that holds all application blobs:
#
#   Container         Purpose
#   ──────────────    ─────────────────────────────────────────────────────────
#   screenshots       Route / trip screenshots uploaded by the mobile app
#   ocr-documents     Source documents (bills of lading, receipts) for OCR
#   exports           Generated CSV / PDF reports
#
# Security model:
#   - No public blob access (allow_nested_items_to_be_public = false)
#   - App Service accesses blobs via Managed Identity (Storage Blob Data
#     Contributor role assigned in module 05) — no shared key in the app
#   - Private Endpoint in snet-private; DNS resolves to private IP inside VNet
#   - public_network_access_enabled = true during bootstrap so the Terraform
#     runner can create containers. Set to false in tfvars after the first
#     apply completes and the Private Endpoint is functional.
#
# Cost optimisation:
#   - Lifecycle policy moves blobs to Cool after 30 days, Archive after 90 days
#   - Screenshots and OCR source docs are deleted after 1 year
# ══════════════════════════════════════════════════════════════════════════════

# ── Storage Account ───────────────────────────────────────────────────────────
# Name rules: 3–24 chars, lowercase alphanumeric only, globally unique.

resource "azurerm_storage_account" "this" {
  name                     = "st${replace(var.prefix, "-", "")}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_kind             = "StorageV2"
  account_tier             = "Standard"
  account_replication_type = var.storage_replication_type # LRS dev / ZRS prod

  # Blob security
  allow_nested_items_to_be_public = false # No anonymous blob access — ever
  https_traffic_only_enabled      = true
  min_tls_version                 = "TLS1_2"

  # Bootstrap: keep true until the Private Endpoint is active and verified.
  # Flip to false in tfvars once module 05 App Service is deployed with MSI.
  public_network_access_enabled = var.storage_public_access_enabled

  blob_properties {
    # Soft-delete gives a recovery window if blobs are accidentally deleted.
    delete_retention_policy {
      days = var.blob_soft_delete_days
    }
    container_delete_retention_policy {
      days = var.blob_soft_delete_days
    }

    # Versioning — keep last N versions of each blob.
    versioning_enabled = false # Enable when audit trail for blobs is needed.
  }

  tags = var.tags

  # This account also stores the Terraform remote state (container: tfstate).
  # Destroying it would lose all infrastructure state — never allow accidental destroy.
  lifecycle {
    prevent_destroy = true
  }
}

# ── Blob Containers ───────────────────────────────────────────────────────────

# Terraform remote state — shared by all environments (dev, prod).
# Key per environment: relaytrace/dev.tfstate, relaytrace/prod.tfstate
resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "screenshots" {
  name                  = "screenshots"
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "ocr_documents" {
  name                  = "ocr-documents"
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "exports" {
  name                  = "exports"
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "private"
}

# ── Lifecycle Management ──────────────────────────────────────────────────────
# Automatically tier and expire blobs to control storage costs.

resource "azurerm_storage_management_policy" "this" {
  storage_account_id = azurerm_storage_account.this.id

  # Screenshots: Cool after 30 d → Archive after 90 d → Delete after 1 year
  rule {
    name    = "screenshots-lifecycle"
    enabled = true

    filters {
      prefix_match = ["screenshots/"]
      blob_types   = ["blockBlob"]
    }

    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than    = 30
        tier_to_archive_after_days_since_modification_greater_than = 90
        delete_after_days_since_modification_greater_than          = 365
      }
      snapshot {
        delete_after_days_since_creation_greater_than = 30
      }
    }
  }

  # OCR source documents: Cool after 7 d → Archive after 30 d → Delete after 1 year
  rule {
    name    = "ocr-documents-lifecycle"
    enabled = true

    filters {
      prefix_match = ["ocr-documents/"]
      blob_types   = ["blockBlob"]
    }

    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than    = 7
        tier_to_archive_after_days_since_modification_greater_than = 30
        delete_after_days_since_modification_greater_than          = 365
      }
    }
  }

  # Exports: Cool after 14 d → Delete after 90 d (reports are short-lived)
  rule {
    name    = "exports-lifecycle"
    enabled = true

    filters {
      prefix_match = ["exports/"]
      blob_types   = ["blockBlob"]
    }

    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than = 14
        delete_after_days_since_modification_greater_than       = 90
      }
    }
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# Private Endpoint + Private DNS Zone
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_private_dns_zone" "storage" {
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "storage" {
  name                  = "pdnslink-storage-${var.prefix}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.storage.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false
  tags                  = var.tags
}

resource "azurerm_private_endpoint" "storage" {
  name                = "pe-storage-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_private_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-storage-${var.prefix}"
    private_connection_resource_id = azurerm_storage_account.this.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdnsgroup-storage-${var.prefix}"
    private_dns_zone_ids = [azurerm_private_dns_zone.storage.id]
  }
}
