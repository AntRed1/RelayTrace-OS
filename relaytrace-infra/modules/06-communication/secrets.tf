# ══════════════════════════════════════════════════════════════════════════════
# Write the ACS connection string to Key Vault.
#
# The API app references this secret as:
#   ACS_CONNECTION_STRING = @Microsoft.KeyVault(VaultName=...;SecretName=acs-connection-string)
#
# The NestJS EmailService uses @azure/communication-email:
#   const client = new EmailClient(process.env.ACS_CONNECTION_STRING);
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_key_vault_secret" "acs_connection_string" {
  name         = "acs-connection-string"
  value        = azurerm_communication_service.this.primary_connection_string
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags
}
