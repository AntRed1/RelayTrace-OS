# ══════════════════════════════════════════════════════════════════════════════
# Write the Application Insights connection string to Key Vault.
# The value is passed in as var.appinsights_connection_string (the resource
# is created in main.tf before module.app_service to avoid circular deps).
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_key_vault_secret" "appinsights_connection_string" {
  name         = "appinsights-connection-string"
  value        = var.appinsights_connection_string
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags
}
