# ── VNet ───────────────────────────────────────────────────────────────────────

output "vnet_id" {
  description = "Resource ID of the Virtual Network."
  value       = azurerm_virtual_network.this.id
}

output "vnet_name" {
  description = "Name of the Virtual Network."
  value       = azurerm_virtual_network.this.name
}

# ── Subnet IDs ─────────────────────────────────────────────────────────────────

output "subnet_appservice_id" {
  description = "Subnet ID for App Service VNet Integration."
  value       = azurerm_subnet.appservice.id
}

output "subnet_data_id" {
  description = "Subnet ID for Redis Cache."
  value       = azurerm_subnet.data.id
}

output "subnet_mysql_id" {
  description = "Subnet ID for MySQL Flexible Server VNet Integration."
  value       = azurerm_subnet.mysql.id
}

output "subnet_private_id" {
  description = "Subnet ID for Private Endpoints (Key Vault, Storage, ACS)."
  value       = azurerm_subnet.private.id
}

# ── NSG IDs ────────────────────────────────────────────────────────────────────

output "nsg_appservice_id" { value = azurerm_network_security_group.appservice.id }
output "nsg_data_id"       { value = azurerm_network_security_group.data.id }
output "nsg_mysql_id"      { value = azurerm_network_security_group.mysql.id }
output "nsg_private_id"    { value = azurerm_network_security_group.private.id }
