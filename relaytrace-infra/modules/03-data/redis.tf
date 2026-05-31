# ══════════════════════════════════════════════════════════════════════════════
# Azure Cache for Redis + Private Endpoint
#
# Private Endpoint lives in snet-data. The NSG on that subnet already allows
# inbound 6379/6380 from snet-appservice. DNS resolves via the private zone
# below so App Service VNet Integration reaches the cache without public access.
# ══════════════════════════════════════════════════════════════════════════════

# ── Private DNS Zone for Redis ────────────────────────────────────────────────

resource "azurerm_private_dns_zone" "redis" {
  name                = "privatelink.redis.cache.windows.net"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "redis" {
  name                  = "pdnslink-redis-${var.prefix}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.redis.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false
  tags                  = var.tags
}

# ── Azure Cache for Redis ─────────────────────────────────────────────────────
# Dev : Basic  C0 (250 MB, no SLA, no replication) — cost-optimised
# Prod: Standard C1 (1 GB, SLA, replication)       — set via tfvars

resource "azurerm_redis_cache" "this" {
  name                = "redis-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name

  sku_name = var.redis_sku_name # "Basic" | "Standard"
  family   = "C"
  capacity = var.redis_capacity # 0 = 250 MB, 1 = 1 GB

  non_ssl_port_enabled          = false # port 6379 disabled; TLS-only on 6380
  minimum_tls_version           = "1.2"
  public_network_access_enabled = false # PE-only access

  redis_configuration {
    maxmemory_policy = "allkeys-lru" # evict LRU keys when memory full
  }

  tags = var.tags
}

# ── Private Endpoint for Redis (in snet-data) ─────────────────────────────────

resource "azurerm_private_endpoint" "redis" {
  name                = "pe-redis-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_data_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-redis-${var.prefix}"
    private_connection_resource_id = azurerm_redis_cache.this.id
    subresource_names              = ["redisCache"]
    is_manual_connection           = false
  }

  # Auto-registers the A record in the private DNS zone.
  private_dns_zone_group {
    name                 = "pdnsgroup-redis-${var.prefix}"
    private_dns_zone_ids = [azurerm_private_dns_zone.redis.id]
  }
}
