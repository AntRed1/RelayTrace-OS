# ══════════════════════════════════════════════════════════════════════════════
# Rule Set, Custom Domains, Routes, and Domain Associations
#
# Rule set:   HTTPS redirect (HTTP 301 → HTTPS on all routes)
# Domains:    relaytrace.net      → Web route
#             www.relaytrace.net  → Web route
#             api.relaytrace.net  → API route
# Routes:     web-route matches /* on both relaytrace.net and www.relaytrace.net
#             api-route matches /* on api.relaytrace.net
#             API route has caching disabled (dynamic responses)
# ══════════════════════════════════════════════════════════════════════════════

# ── Rule Set & HTTPS Redirect Rule ───────────────────────────────────────────

resource "azurerm_cdn_frontdoor_rule_set" "this" {
  name                     = "ruleset${replace(var.prefix, "-", "")}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id
}

resource "azurerm_cdn_frontdoor_rule" "https_redirect" {
  name                      = "HttpsRedirect"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.this.id
  order                     = 1
  behavior_on_match         = "Continue"

  conditions {
    request_scheme_condition {
      operator         = "Equal"
      negate_condition = false
      match_values     = ["HTTP"]
    }
  }

  actions {
    url_redirect_action {
      redirect_type        = "PermanentRedirect"
      redirect_protocol    = "Https"
      destination_hostname = ""
    }
  }

  depends_on = [azurerm_cdn_frontdoor_origin_group.api, azurerm_cdn_frontdoor_origin_group.web]
}

# ── Custom Domains ────────────────────────────────────────────────────────────
# Azure provisions managed TLS certificates automatically after DNS validation.
# Add the CNAME + TXT records output by 'terraform output frontdoor_dns_records'.

resource "azurerm_cdn_frontdoor_custom_domain" "web_root" {
  name                     = "domain-web-root-${replace(var.web_root_domain, ".", "-")}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id
  host_name                = var.web_root_domain

  tls {
    certificate_type = "ManagedCertificate"
    minimum_version  = "TLS12"
  }
}

resource "azurerm_cdn_frontdoor_custom_domain" "web" {
  name                     = "domain-web-${replace(var.web_custom_domain, ".", "-")}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id
  host_name                = var.web_custom_domain

  tls {
    certificate_type = "ManagedCertificate"
    minimum_version  = "TLS12"
  }
}

resource "azurerm_cdn_frontdoor_custom_domain" "api" {
  name                     = "domain-api-${replace(var.api_custom_domain, ".", "-")}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id
  host_name                = var.api_custom_domain

  tls {
    certificate_type = "ManagedCertificate"
    minimum_version  = "TLS12"
  }
}

# ── Routes ────────────────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_route" "web" {
  name                          = "web-route"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.this.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.web.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.web.id]
  cdn_frontdoor_rule_set_ids    = [azurerm_cdn_frontdoor_rule_set.this.id]

  cdn_frontdoor_custom_domain_ids = [
    azurerm_cdn_frontdoor_custom_domain.web_root.id,
    azurerm_cdn_frontdoor_custom_domain.web.id
  ]

  supported_protocols    = ["Http", "Https"]
  patterns_to_match      = ["/*"]
  forwarding_protocol    = "HttpsOnly"
  https_redirect_enabled = true
  link_to_default_domain = false

  # Next.js cache headers (Cache-Control, Surrogate-Control) drive CDN caching.
  # Front Door honours them without additional configuration here.
}

resource "azurerm_cdn_frontdoor_route" "api" {
  name                          = "api-route"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.this.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.api.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.api.id]
  cdn_frontdoor_rule_set_ids    = [azurerm_cdn_frontdoor_rule_set.this.id]

  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.api.id]

  supported_protocols    = ["Http", "Https"]
  patterns_to_match      = ["/*"]
  forwarding_protocol    = "HttpsOnly"
  https_redirect_enabled = true
  link_to_default_domain = false

  # API responses are dynamic — do not cache at the CDN level.
}

# ── Custom Domain ↔ Route associations ───────────────────────────────────────
# Required to complete the domain → route binding.

resource "azurerm_cdn_frontdoor_custom_domain_association" "web_root" {
  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.web_root.id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.web.id]
}

resource "azurerm_cdn_frontdoor_custom_domain_association" "web" {
  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.web.id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.web.id]
}

resource "azurerm_cdn_frontdoor_custom_domain_association" "api" {
  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.api.id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.api.id]
}
