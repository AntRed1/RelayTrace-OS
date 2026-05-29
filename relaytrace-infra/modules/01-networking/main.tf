# ══════════════════════════════════════════════════════════════════════════════
# Module: 01-networking
#
# Creates the full network foundation for RelayTrace OS:
#   - Virtual Network
#   - 4 subnets: appservice, data, mysql, private
#   - NSGs per subnet with least-privilege rules
#   - NSG ↔ subnet associations
#
# Subnet map:
#   snet-appservice  10.0.1.0/24  App Service VNet Integration (delegation)
#   snet-data        10.0.2.0/24  Azure Cache for Redis
#   snet-mysql       10.0.3.0/24  MySQL Flexible Server VNet Integration (delegation)
#   snet-private     10.0.4.0/24  Private Endpoints (Key Vault, Storage, ACS)
#
# MySQL note:
#   Module 03 (data) creates the MySQL Flexible Server and places it in snet-mysql
#   via VNet Integration. Traffic from App Service stays inside the VNet.
#
# Docker Hub note:
#   Images are pulled by the App Service control plane (not via VNet Integration),
#   so Docker Hub traffic is not governed by these NSG rules.
# ══════════════════════════════════════════════════════════════════════════════

# ── Virtual Network ───────────────────────────────────────────────────────────

resource "azurerm_virtual_network" "this" {
  name                = "vnet-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = [var.vnet_address_space]
  tags                = var.tags
}

# ══════════════════════════════════════════════════════════════════════════════
# Subnets
# ══════════════════════════════════════════════════════════════════════════════

# ── snet-appservice (10.0.1.0/24) ─────────────────────────────────────────────
# App Service Regional VNet Integration — governs outbound traffic from the app.
# Requires delegation to Microsoft.Web/serverFarms.

resource "azurerm_subnet" "appservice" {
  name                 = "snet-appservice-${var.prefix}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [var.subnet_appservice_prefix]

  delegation {
    name = "appservice-delegation"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

# ── snet-data (10.0.2.0/24) ───────────────────────────────────────────────────
# Azure Cache for Redis. No delegation required.

resource "azurerm_subnet" "data" {
  name                 = "snet-data-${var.prefix}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [var.subnet_data_prefix]

  # Required for the Redis Cache Private Endpoint to function.
  private_endpoint_network_policies = "Disabled"
}

# ── snet-mysql (10.0.3.0/24) ──────────────────────────────────────────────────
# MySQL Flexible Server VNet Integration.
# Requires delegation to Microsoft.DBforMySQL/flexibleServers.
# The actual server is created in module 03 (data).

resource "azurerm_subnet" "mysql" {
  name                 = "snet-mysql-${var.prefix}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [var.subnet_mysql_prefix]

  delegation {
    name = "mysql-delegation"
    service_delegation {
      name    = "Microsoft.DBforMySQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}

# ── snet-private (10.0.4.0/24) ────────────────────────────────────────────────
# Private Endpoints for Key Vault, Storage Account, and ACS.
# private_endpoint_network_policies must be disabled for PEs to function.

resource "azurerm_subnet" "private" {
  name                 = "snet-private-${var.prefix}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [var.subnet_private_prefix]

  private_endpoint_network_policies = "Disabled"
}

# ══════════════════════════════════════════════════════════════════════════════
# Network Security Groups
# ══════════════════════════════════════════════════════════════════════════════

# ── NSG — App Service subnet ──────────────────────────────────────────────────
# Controls OUTBOUND traffic from NestJS/Next.js through VNet Integration.
# Inbound to App Service is managed by its own Access Restrictions (not NSG).

resource "azurerm_network_security_group" "appservice" {
  name                = "nsg-appservice-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags

  # ── Outbound: Redis (inside VNet) ────────────────────────────────────────
  security_rule {
    name                       = "Allow-Outbound-Redis"
    priority                   = 100
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["6379", "6380"]
    source_address_prefix      = var.subnet_appservice_prefix
    destination_address_prefix = var.subnet_data_prefix
  }

  # ── Outbound: MySQL (inside VNet via snet-mysql) ──────────────────────────
  # Traffic stays within the VNet — no Internet hop.
  security_rule {
    name                       = "Allow-Outbound-MySQL"
    priority                   = 110
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3306"
    source_address_prefix      = var.subnet_appservice_prefix
    destination_address_prefix = var.subnet_mysql_prefix
  }

  # ── Outbound: Private Endpoints — Key Vault, Storage, ACS (HTTPS) ────────
  security_rule {
    name                       = "Allow-Outbound-PrivateEndpoints"
    priority                   = 120
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.subnet_appservice_prefix
    destination_address_prefix = var.subnet_private_prefix
  }

  # ── Outbound: Internet HTTPS — Stripe API, Docker Hub, external services ──
  security_rule {
    name                       = "Allow-Outbound-Internet-HTTPS"
    priority                   = 130
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.subnet_appservice_prefix
    destination_address_prefix = "Internet"
  }

  # ── Outbound: Azure Monitor / Log Analytics ───────────────────────────────
  security_rule {
    name                       = "Allow-Outbound-AzureMonitor"
    priority                   = 140
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.subnet_appservice_prefix
    destination_address_prefix = "AzureMonitor"
  }
}

# ── NSG — Data subnet (Redis) ─────────────────────────────────────────────────

resource "azurerm_network_security_group" "data" {
  name                = "nsg-data-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags

  # Allow Redis inbound only from App Service subnet
  security_rule {
    name                       = "Allow-Inbound-Redis-From-AppService"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["6379", "6380"]
    source_address_prefix      = var.subnet_appservice_prefix
    destination_address_prefix = var.subnet_data_prefix
  }

  # Azure Load Balancer health probes — required by Azure Cache for Redis
  security_rule {
    name                       = "Allow-Inbound-AzureLoadBalancer"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "AzureLoadBalancer"
    destination_address_prefix = "*"
  }

  # Block all other inbound from Internet
  security_rule {
    name                       = "Deny-Inbound-Internet"
    priority                   = 4000
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

# ── NSG — MySQL subnet ────────────────────────────────────────────────────────
# MySQL Flexible Server is VNet-integrated. Only App Service may reach port 3306.

resource "azurerm_network_security_group" "mysql" {
  name                = "nsg-mysql-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags

  # Allow MySQL inbound only from App Service subnet
  security_rule {
    name                       = "Allow-Inbound-MySQL-From-AppService"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3306"
    source_address_prefix      = var.subnet_appservice_prefix
    destination_address_prefix = var.subnet_mysql_prefix
  }

  # Block all other inbound from Internet
  security_rule {
    name                       = "Deny-Inbound-Internet"
    priority                   = 4000
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

# ── NSG — Private Endpoints subnet ────────────────────────────────────────────

resource "azurerm_network_security_group" "private" {
  name                = "nsg-private-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags

  # Allow HTTPS inbound from App Service (for Key Vault, Storage, and ACS)
  security_rule {
    name                       = "Allow-Inbound-HTTPS-From-AppService"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.subnet_appservice_prefix
    destination_address_prefix = var.subnet_private_prefix
  }

  # Azure DNS (168.63.129.16) — required for Private DNS zone resolution
  security_rule {
    name                       = "Allow-Inbound-AzureDNS"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "168.63.129.16/32"
    destination_address_prefix = "*"
  }

  # Block all inbound from Internet — Private Endpoints are VNet-only
  security_rule {
    name                       = "Deny-Inbound-Internet"
    priority                   = 4000
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# NSG ↔ Subnet associations
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_subnet_network_security_group_association" "appservice" {
  subnet_id                 = azurerm_subnet.appservice.id
  network_security_group_id = azurerm_network_security_group.appservice.id
}

resource "azurerm_subnet_network_security_group_association" "data" {
  subnet_id                 = azurerm_subnet.data.id
  network_security_group_id = azurerm_network_security_group.data.id
}

resource "azurerm_subnet_network_security_group_association" "mysql" {
  subnet_id                 = azurerm_subnet.mysql.id
  network_security_group_id = azurerm_network_security_group.mysql.id
}

resource "azurerm_subnet_network_security_group_association" "private" {
  subnet_id                 = azurerm_subnet.private.id
  network_security_group_id = azurerm_network_security_group.private.id
}
