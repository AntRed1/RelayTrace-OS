# ── Storage Account ───────────────────────────────────────────────────────────

output "storage_account_id" {
  description = "Resource ID of the Storage Account."
  value       = azurerm_storage_account.this.id
}

output "storage_account_name" {
  description = "Name of the Storage Account (used for MSI-based access)."
  value       = azurerm_storage_account.this.name
}

output "storage_account_primary_blob_endpoint" {
  description = "Primary blob service endpoint (resolves to private IP via DNS when PE is active)."
  value       = azurerm_storage_account.this.primary_blob_endpoint
}

# ── Container names ───────────────────────────────────────────────────────────

output "container_screenshots" {
  value = azurerm_storage_container.screenshots.name
}

output "container_ocr_documents" {
  value = azurerm_storage_container.ocr_documents.name
}

output "container_exports" {
  value = azurerm_storage_container.exports.name
}

# ── Key Vault secret URI ──────────────────────────────────────────────────────

output "secret_uri_storage_account_name" {
  description = "Versionless Key Vault URI for the storage-account-name secret."
  value       = azurerm_key_vault_secret.storage_account_name.versionless_id
}
