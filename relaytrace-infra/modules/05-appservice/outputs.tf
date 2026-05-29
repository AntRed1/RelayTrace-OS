# ── App Service Plan ──────────────────────────────────────────────────────────

output "service_plan_id" {
  description = "Resource ID of the shared App Service Plan."
  value       = azurerm_service_plan.this.id
}

# ── API Web App ───────────────────────────────────────────────────────────────

output "api_app_id" {
  description = "Resource ID of the API Web App."
  value       = azurerm_linux_web_app.api.id
}

output "api_app_name" {
  description = "Name of the API Web App."
  value       = azurerm_linux_web_app.api.name
}

output "api_default_hostname" {
  description = "Default hostname of the API Web App (*.azurewebsites.net)."
  value       = azurerm_linux_web_app.api.default_hostname
}

output "api_principal_id" {
  description = "Object ID of the API app's System-Assigned Managed Identity."
  value       = azurerm_linux_web_app.api.identity[0].principal_id
}

# ── Web App ───────────────────────────────────────────────────────────────────

output "web_app_id" {
  description = "Resource ID of the Web App."
  value       = azurerm_linux_web_app.web.id
}

output "web_app_name" {
  description = "Name of the Web App."
  value       = azurerm_linux_web_app.web.name
}

output "web_default_hostname" {
  description = "Default hostname of the Web App (*.azurewebsites.net)."
  value       = azurerm_linux_web_app.web.default_hostname
}

output "web_principal_id" {
  description = "Object ID of the Web app's System-Assigned Managed Identity."
  value       = azurerm_linux_web_app.web.identity[0].principal_id
}
