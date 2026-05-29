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
# Redis connection string — ioredis URL format (SSL, port 6380):
#   rediss://:PASS@HOST:6380
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_key_vault_secret" "mysql_connection_string" {
  name         = "mysql-connection-string"
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags

  value = "mysql://${var.mysql_admin_username}:${var.mysql_admin_password}@${azurerm_mysql_flexible_server.this.fqdn}:3306/${azurerm_mysql_flexible_database.app.name}?sslaccept=strict"
}

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "redis-connection-string"
  key_vault_id = var.key_vault_id
  content_type = "text/plain"
  tags         = var.tags

  value = "rediss://:${azurerm_redis_cache.this.primary_access_key}@${azurerm_redis_cache.this.hostname}:${azurerm_redis_cache.this.ssl_port}"
}
