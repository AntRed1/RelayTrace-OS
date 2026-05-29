# ── Log Analytics Workspace ───────────────────────────────────────────────────

output "workspace_id" {
  description = "Resource ID of the Log Analytics Workspace."
  value       = azurerm_log_analytics_workspace.this.id
}

output "workspace_name" {
  description = "Name of the Log Analytics Workspace."
  value       = azurerm_log_analytics_workspace.this.name
}

# ── Application Insights ──────────────────────────────────────────────────────

output "app_insights_id" {
  description = "Resource ID of the Application Insights instance."
  value       = azurerm_application_insights.this.id
}

output "app_insights_name" {
  description = "Name of the Application Insights instance."
  value       = azurerm_application_insights.this.name
}

output "instrumentation_key" {
  description = "Application Insights instrumentation key (legacy — prefer connection_string)."
  value       = azurerm_application_insights.this.instrumentation_key
  sensitive   = true
}

output "connection_string" {
  description = "Application Insights connection string."
  value       = azurerm_application_insights.this.connection_string
  sensitive   = true
}

# ── Key Vault secret URI ──────────────────────────────────────────────────────

output "secret_uri_appinsights_connection_string" {
  description = "Versionless Key Vault URI for the appinsights-connection-string secret."
  value       = azurerm_key_vault_secret.appinsights_connection_string.versionless_id
}
