# ══════════════════════════════════════════════════════════════════════════════
# Origin Groups and Origins
#
# Two origin groups — one per backend app:
#   og-api  →  app-api-{prefix}.azurewebsites.net  (NestJS)
#   og-web  →  app-web-{prefix}.azurewebsites.net  (Next.js)
#
# Health probes verify each backend independently. Front Door automatically
# stops sending traffic to unhealthy origins.
# ══════════════════════════════════════════════════════════════════════════════

# ── API Origin Group ──────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_origin_group" "api" {
  name                     = "og-api-${var.prefix}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id

  load_balancing {
    sample_size                        = 4
    successful_samples_required        = 3
    additional_latency_in_milliseconds = 50
  }

  health_probe {
    path                = "/health"
    protocol            = "Https"
    request_type        = "HEAD"
    interval_in_seconds = 30
  }
}

resource "azurerm_cdn_frontdoor_origin" "api" {
  name                          = "origin-api-${var.prefix}"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.api.id

  host_name          = var.api_app_hostname
  origin_host_header = var.api_app_hostname
  http_port          = 80
  https_port         = 443
  priority           = 1
  weight             = 1000
  enabled            = true

  # certificate_name_check_enabled must be true for *.azurewebsites.net origins.
  certificate_name_check_enabled = true
}

# ── Web Origin Group ──────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_origin_group" "web" {
  name                     = "og-web-${var.prefix}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id

  load_balancing {
    sample_size                        = 4
    successful_samples_required        = 3
    additional_latency_in_milliseconds = 50
  }

  health_probe {
    path                = "/"
    protocol            = "Https"
    request_type        = "HEAD"
    interval_in_seconds = 100
  }
}

resource "azurerm_cdn_frontdoor_origin" "web" {
  name                          = "origin-web-${var.prefix}"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.web.id

  host_name          = var.web_app_hostname
  origin_host_header = var.web_app_hostname
  http_port          = 80
  https_port         = 443
  priority           = 1
  weight             = 1000
  enabled            = true

  certificate_name_check_enabled = true
}
