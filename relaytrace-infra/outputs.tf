# ── Resource Group ─────────────────────────────────────────────────────────────

output "resource_group_name" {
  description = "Name of the main resource group."
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  value = azurerm_resource_group.main.location
}

# ── Networking ─────────────────────────────────────────────────────────────────

output "vnet_id" {
  description = "Resource ID of the Virtual Network."
  value       = module.networking.vnet_id
}

output "vnet_name" {
  value = module.networking.vnet_name
}

output "subnet_appservice_id" {
  value = module.networking.subnet_appservice_id
}

output "subnet_data_id" {
  value = module.networking.subnet_data_id
}

output "subnet_mysql_id" {
  value = module.networking.subnet_mysql_id
}

output "subnet_private_id" {
  value = module.networking.subnet_private_id
}

# ── Key Vault ─────────────────────────────────────────────────────────────────

output "key_vault_name" {
  description = "Name of the Key Vault."
  value       = module.keyvault.key_vault_name
}

output "key_vault_uri" {
  description = "URI of the Key Vault."
  value       = module.keyvault.key_vault_uri
}

# ── Data ──────────────────────────────────────────────────────────────────────

output "mysql_server_fqdn" {
  description = "FQDN of the MySQL Flexible Server (private, VNet-only)."
  value       = module.data.mysql_server_fqdn
}

output "mysql_db_name" {
  value = module.data.mysql_db_name
}

output "redis_hostname" {
  description = "Hostname of the Redis cache (resolves to private IP)."
  value       = module.data.redis_hostname
}

# ── Storage ───────────────────────────────────────────────────────────────────

output "storage_account_name" {
  description = "Name of the Storage Account."
  value       = module.storage.storage_account_name
}

output "storage_primary_blob_endpoint" {
  description = "Primary blob endpoint (private after PE is active)."
  value       = module.storage.storage_account_primary_blob_endpoint
}

# ── App Service ───────────────────────────────────────────────────────────────

output "api_url" {
  description = "Default URL of the NestJS API (azurewebsites.net)."
  value       = "https://${module.app_service.api_default_hostname}"
}

output "web_url" {
  description = "Default URL of the Next.js Web app (azurewebsites.net)."
  value       = "https://${module.app_service.web_default_hostname}"
}

output "api_principal_id" {
  description = "Managed Identity principal ID of the API app (for additional RBAC)."
  value       = module.app_service.api_principal_id
}

output "web_principal_id" {
  description = "Managed Identity principal ID of the Web app (for additional RBAC)."
  value       = module.app_service.web_principal_id
}

# ── Communication ─────────────────────────────────────────────────────────────

output "email_domain" {
  description = "Configured email sending domain."
  value       = module.communication.email_domain
}

output "acs_dns_verification_records" {
  description = "ACS email domain DNS records — add to registrar, then verify in Azure Portal."
  value       = module.communication.dns_verification_records
}

# ── Front Door ────────────────────────────────────────────────────────────────

output "frontdoor_endpoint" {
  description = "Front Door default hostname (available without DNS setup)."
  value       = module.frontdoor.frontdoor_endpoint_hostname
}

output "web_public_url" {
  description = "Public Web URL via Front Door (active after DNS validation)."
  value       = module.frontdoor.web_url
}

output "api_public_url" {
  description = "Public API URL via Front Door (active after DNS validation)."
  value       = module.frontdoor.api_url
}

output "frontdoor_dns_records" {
  description = "DNS records for custom domain validation. Run: terraform output frontdoor_dns_records"
  value       = module.frontdoor.frontdoor_dns_records
}

output "frontdoor_profile_id" {
  description = "Front Door profile ID — use as X-Azure-FDID value when locking down App Service."
  value       = module.frontdoor.frontdoor_profile_id
}

# ── Observability ─────────────────────────────────────────────────────────────

output "log_analytics_workspace_id" {
  description = "Resource ID of the Log Analytics Workspace."
  value       = module.observability.workspace_id
}

output "app_insights_name" {
  description = "Name of the Application Insights instance."
  value       = module.observability.app_insights_name
}
