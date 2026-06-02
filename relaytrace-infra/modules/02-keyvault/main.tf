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
#   - Public access enabled (dev); network_acls default_action = "Allow"
#   - For prod, restrict to managed identity + ci_runner_ips via network_acls
# ══════════════════════════════════════════════════════════════════════════════

data "azurerm_client_config" "current" {}

# ── Key Vault ─────────────────────────────────────────────────────────────────

resource "azurerm_key_vault" "this" {
  name                = "kv-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  soft_delete_retention_days    = 90
  purge_protection_enabled      = var.purge_protection_enabled
  public_network_access_enabled = true

  # Allow during bootstrap; tighten to "Deny" + ip_rules after first apply.
  network_acls {
    bypass         = "AzureServices"
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
# Key Vault is now publicly accessible (dev environment optimization)
# Private Endpoint + Private DNS Zone removed to reduce costs
# ══════════════════════════════════════════════════════════════════════════════
