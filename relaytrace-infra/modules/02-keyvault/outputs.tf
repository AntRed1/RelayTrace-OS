# ── Key Vault ─────────────────────────────────────────────────────────────────

output "key_vault_id" {
  description = "Resource ID of the Key Vault."
  value       = azurerm_key_vault.this.id
}

output "key_vault_uri" {
  description = "URI of the Key Vault (e.g. https://kv-relaytrace-dev.vault.azure.net/)."
  value       = azurerm_key_vault.this.vault_uri
}

output "key_vault_name" {
  description = "Name of the Key Vault."
  value       = azurerm_key_vault.this.name
}

# ── Secret URIs (used for Key Vault references in App Service app settings) ───

output "secret_uri_mysql_admin_password" {
  description = "Versioned URI of the mysql-admin-password secret."
  value       = azurerm_key_vault_secret.mysql_admin_password.versionless_id
}

output "secret_uri_jwt_access" {
  description = "Versioned URI of the jwt-access-secret secret."
  value       = azurerm_key_vault_secret.jwt_access_secret.versionless_id
}

output "secret_uri_jwt_refresh" {
  description = "Versioned URI of the jwt-refresh-secret secret."
  value       = azurerm_key_vault_secret.jwt_refresh_secret.versionless_id
}

output "secret_uri_stripe_secret_key" {
  description = "Versioned URI of the stripe-secret-key secret."
  value       = azurerm_key_vault_secret.stripe_secret_key.versionless_id
}

output "secret_uri_stripe_webhook_secret" {
  description = "Versioned URI of the stripe-webhook-secret secret."
  value       = azurerm_key_vault_secret.stripe_webhook_secret.versionless_id
}

# ── Raw secret values (sensitive) — consumed by downstream modules ────────────

output "mysql_admin_password" {
  description = "Generated MySQL admin password. Used by module 03 to create the server."
  value       = random_password.mysql_admin.result
  sensitive   = true
}
