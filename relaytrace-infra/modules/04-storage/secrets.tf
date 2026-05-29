# ══════════════════════════════════════════════════════════════════════════════
# Write the storage account name to Key Vault.
#
# The App Service (module 05) references this secret to know which storage
# account to target. Authentication is done via Managed Identity — no shared
# key or SAS token is stored.
#
# App Service env var pattern (set in module 05):
#   AZURE_STORAGE_ACCOUNT_NAME = @Microsoft.KeyVault(SecretUri=...)
#   Container names are passed as plain env vars (not secret).
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_key_vault_secret" "storage_account_name" {
  name         = "storage-account-name"
  value        = azurerm_storage_account.this.name
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags
}
