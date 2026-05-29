# ══════════════════════════════════════════════════════════════════════════════
# Module: 02-keyvault
#
# Provisions the Azure Key Vault that centralises ALL application secrets:
#   - Generated secrets: MySQL admin password, JWT signing keys
#   - Passed-in secrets: Stripe API key, Stripe webhook secret
#   - Placeholders populated by later modules: Redis + MySQL connection strings,
#     ACS connection string (modules 03 and 06)
#
# Security model:
#   - RBAC authorization enabled (no legacy access policies)
#   - Terraform service principal → Key Vault Secrets Officer (write during apply)
#   - App Service Managed Identity → Key Vault Secrets User (added in module 05)
#   - Private Endpoint in snet-private; Private DNS zone auto-registers the A record
#   - network_acls default_action = "Allow" during bootstrap so the Terraform runner
#     can reach the plane during the same apply that creates the PE.
#     Lock to "Deny" + add ci_runner_ips after the first successful apply.
# ══════════════════════════════════════════════════════════════════════════════

data "azurerm_client_config" "current" {}

# ── Key Vault ─────────────────────────────────────────────────────────────────

resource "azurerm_key_vault" "this" {
  name                = "kv-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  enable_rbac_authorization  = true
  soft_delete_retention_days = 90
  purge_protection_enabled   = var.purge_protection_enabled

  # Allow during bootstrap; tighten to "Deny" + ip_rules after first apply.
  network_acls {
    bypass         = ["AzureServices"]
    default_action = "Allow"
    ip_rules       = var.ci_runner_ips
  }

  tags = var.tags
}

# ── RBAC: Terraform runner can create / update secrets ────────────────────────

resource "azurerm_role_assignment" "terraform_secrets_officer" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

# ══════════════════════════════════════════════════════════════════════════════
# Private Endpoint + Private DNS Zone
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_private_dns_zone" "keyvault" {
  name                = "privatelink.vaultcore.azure.net"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "keyvault" {
  name                  = "pdnslink-kv-${var.prefix}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.keyvault.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false
  tags                  = var.tags
}

resource "azurerm_private_endpoint" "keyvault" {
  name                = "pe-kv-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_private_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-kv-${var.prefix}"
    private_connection_resource_id = azurerm_key_vault.this.id
    subresource_names              = ["vault"]
    is_manual_connection           = false
  }

  # Automatically registers the A record in the private DNS zone.
  private_dns_zone_group {
    name                 = "pdnsgroup-kv-${var.prefix}"
    private_dns_zone_ids = [azurerm_private_dns_zone.keyvault.id]
  }
}
