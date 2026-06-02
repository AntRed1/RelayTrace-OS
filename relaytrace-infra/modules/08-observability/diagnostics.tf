# ══════════════════════════════════════════════════════════════════════════════
# Diagnostic Settings
#
# Each setting forwards logs and metrics to the shared Log Analytics workspace.
# Use KQL in the Portal to correlate across all resources.
#
# Resources covered:
#   API App Service, Web App Service, Key Vault,
#   MySQL Flexible Server, Redis Cache, Storage Account (blob)
# ══════════════════════════════════════════════════════════════════════════════

# ── App Service — API ─────────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "api_app" {
  name                       = "diag-api-${var.prefix}"
  target_resource_id         = var.api_app_id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log { category = "AppServiceHTTPLogs" }    # HTTP access log
  enabled_log { category = "AppServiceConsoleLogs" } # Container stdout/stderr
  enabled_log { category = "AppServiceAppLogs" }     # App-level logging
  enabled_log { category = "AppServiceAuditLogs" }   # Auth / access audit

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# ── App Service — Web ─────────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "web_app" {
  name                       = "diag-web-${var.prefix}"
  target_resource_id         = var.web_app_id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log { category = "AppServiceHTTPLogs" }
  enabled_log { category = "AppServiceConsoleLogs" }
  enabled_log { category = "AppServiceAppLogs" }
  enabled_log { category = "AppServiceAuditLogs" }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# ── Key Vault ─────────────────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "keyvault" {
  name                       = "diag-kv-${var.prefix}"
  target_resource_id         = var.key_vault_id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log { category = "AuditEvent" } # Secret access audit
  enabled_log { category = "AzurePolicyEvaluationDetails" }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# ── MySQL Flexible Server ─────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "mysql" {
  name                       = "diag-mysql-${var.prefix}"
  target_resource_id         = var.mysql_server_id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log { category = "MySqlSlowLogs" }  # Requires slow_query_log=ON on server
  enabled_log { category = "MySqlAuditLogs" } # Requires audit_log_enabled=ON

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# ── Redis Cache ───────────────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "redis" {
  name                       = "diag-redis-${var.prefix}"
  target_resource_id         = var.redis_id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log { category = "ConnectedClientList" }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# ── Storage Account — Blob service ────────────────────────────────────────────
# Diagnostic settings for Storage must target the sub-resource path.

resource "azurerm_monitor_diagnostic_setting" "storage_blob" {
  name                       = "diag-storage-blob-${var.prefix}"
  target_resource_id         = "${var.storage_account_id}/blobServices/default"
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log { category = "StorageRead" }
  enabled_log { category = "StorageWrite" }
  enabled_log { category = "StorageDelete" }

  metric {
    category = "Transaction"
    enabled  = true
  }
}
