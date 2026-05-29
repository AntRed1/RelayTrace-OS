# ══════════════════════════════════════════════════════════════════════════════
# Write the Application Insights connection string to Key Vault.
#
# Both App Service apps reference it as:
#   APPLICATIONINSIGHTS_CONNECTION_STRING = @Microsoft.KeyVault(VaultName=...;SecretName=appinsights-connection-string)
#
# The Node.js Application Insights SDK reads this env var automatically:
#   import 'applicationinsights';   ← add to main.ts before any other import
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_key_vault_secret" "appinsights_connection_string" {
  name         = "appinsights-connection-string"
  value        = azurerm_application_insights.this.connection_string
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags
}
