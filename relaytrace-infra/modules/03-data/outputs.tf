# ── MySQL ─────────────────────────────────────────────────────────────────────

output "mysql_server_id" {
  description = "Resource ID of the MySQL Flexible Server."
  value       = azurerm_mysql_flexible_server.this.id
}

output "mysql_server_fqdn" {
  description = "FQDN of the MySQL Flexible Server (private DNS, VNet-only)."
  value       = azurerm_mysql_flexible_server.this.fqdn
}

output "mysql_db_name" {
  description = "Name of the application database."
  value       = azurerm_mysql_flexible_database.app.name
}

# ── Redis ─────────────────────────────────────────────────────────────────────

output "redis_id" {
  description = "Resource ID of the Azure Cache for Redis."
  value       = azurerm_redis_cache.this.id
}

output "redis_hostname" {
  description = "Hostname of the Redis cache (resolves to private IP via DNS)."
  value       = azurerm_redis_cache.this.hostname
}

output "redis_ssl_port" {
  description = "SSL port for the Redis cache (6380)."
  value       = azurerm_redis_cache.this.ssl_port
}

output "redis_primary_key" {
  description = "Primary access key for the Redis cache."
  value       = azurerm_redis_cache.this.primary_access_key
  sensitive   = true
}

# ── Key Vault secret URIs ─────────────────────────────────────────────────────

output "secret_uri_mysql_connection_string" {
  description = "Versionless Key Vault URI for the MySQL connection string secret."
  value       = azurerm_key_vault_secret.mysql_connection_string.versionless_id
}

output "secret_uri_redis_host" {
  description = "Versionless Key Vault URI for the Redis hostname secret."
  value       = azurerm_key_vault_secret.redis_host.versionless_id
}

output "secret_uri_redis_password" {
  description = "Versionless Key Vault URI for the Redis access key secret."
  value       = azurerm_key_vault_secret.redis_password.versionless_id
}
