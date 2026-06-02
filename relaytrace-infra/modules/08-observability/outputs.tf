# ── Log Analytics Workspace ───────────────────────────────────────────────────

output "workspace_id" {
  description = "Resource ID of the Log Analytics Workspace."
  value       = var.log_analytics_workspace_id
}

# ── Application Insights ──────────────────────────────────────────────────────

output "app_insights_id" {
  description = "Resource ID of the Application Insights instance."
  value       = var.application_insights_id
}

output "connection_string" {
  description = "Application Insights connection string."
  value       = var.appinsights_connection_string
  sensitive   = true
}

# ── Key Vault secret URI ──────────────────────────────────────────────────────

output "secret_uri_appinsights_connection_string" {
  description = "Versionless Key Vault URI for the appinsights-connection-string secret."
  value       = azurerm_key_vault_secret.appinsights_connection_string.versionless_id
}
