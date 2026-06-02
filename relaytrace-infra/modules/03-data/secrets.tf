# ══════════════════════════════════════════════════════════════════════════════
# Write connection strings to Key Vault
#
# These secrets are consumed by module 05 (App Service) as Key Vault references
# in the application settings, so the actual values never appear in plain text
# in App Service config.
#
# MySQL connection string — Prisma DATABASE_URL format:
#   mysql://USER:PASS@HOST:3306/DB?sslaccept=strict
#
# Redis — the API reads discrete host/password (ioredis + BullMQ), so the
# hostname and access key are stored as separate secrets rather than a URL.
# Port (6380) and TLS flag are plain app settings in module 05.
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_key_vault_secret" "mysql_connection_string" {
  name         = "mysql-connection-string"
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags

  # urlencode() is critical: the random password may contain chars like ?, #, &, :
  # that would break MySQL URL parsing if not percent-encoded.
  value = "mysql://${var.mysql_admin_username}:${urlencode(var.mysql_admin_password)}@${azurerm_mysql_flexible_server.this.fqdn}:3306/${azurerm_mysql_flexible_database.app.name}?sslaccept=strict"
}

resource "azurerm_key_vault_secret" "redis_host" {
  name         = "redis-host"
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags

  value = azurerm_redis_cache.this.hostname
}

resource "azurerm_key_vault_secret" "redis_password" {
  name         = "redis-password"
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags

  value = azurerm_redis_cache.this.primary_access_key
}
