# ══════════════════════════════════════════════════════════════════════════════
# Module: 07-frontdoor
#
# Provisions Azure Front Door Standard as the global edge layer:
#
#   Front Door Profile (Standard_AzureFrontDoor)
#   WAF Policy — DefaultRuleSet 1.0, Bot Protection 1.0
#   Endpoint    — fd-{prefix}.azurefd.net
#   Origins     — API App Service + Web App Service
#   Routes      — api.relaytrace.com → API, www.relaytrace.com → Web
#   Custom domains with Azure-managed TLS certificates
#   Rule: HTTP → HTTPS permanent redirect
#   Security policy — WAF applied to all custom domains + endpoint
#
# ─── Post-apply DNS steps ─────────────────────────────────────────────────────
#  Run: terraform output frontdoor_dns_records
#  For each custom domain, add to your registrar:
#    1. CNAME  {subdomain}           → {endpoint}.azurefd.net
#    2. TXT    _dnsauth.{subdomain}  → {validation_token}
#  DNS validation triggers automatic TLS certificate provisioning.
#
# ─── Post-apply App Service lockdown ─────────────────────────────────────────
#  Once Front Door is active, restrict App Service access:
#    Portal → App Service → Networking → Access Restrictions
#    Allow:  service tag = AzureFrontDoor.Backend, header X-Azure-FDID = {profile_id}
#    Deny:   0.0.0.0/0 (all others)
#  Run: terraform output frontdoor_profile_id   ← use as the FDID header value
# ══════════════════════════════════════════════════════════════════════════════

# ── Front Door Profile ────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_profile" "this" {
  name                     = "fd-${var.prefix}"
  resource_group_name      = var.resource_group_name
  sku_name                 = "Standard_AzureFrontDoor"
  response_timeout_seconds = 120    # Allow up to 2 min for slow API responses
  tags                     = var.tags
}

# ── Front Door Endpoint ───────────────────────────────────────────────────────
# The *.azurefd.net hostname is available immediately; custom domains activate
# after DNS validation (see post-apply steps above).

resource "azurerm_cdn_frontdoor_endpoint" "this" {
  name                     = "fd-${var.prefix}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id
  tags                     = var.tags
}

# ── WAF Policy ────────────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_firewall_policy" "this" {
  name                              = "waf${replace(var.prefix, "-", "")}"
  resource_group_name               = var.resource_group_name
  sku_name                          = "Standard_AzureFrontDoor"
  enabled                           = true
  mode                              = var.waf_mode   # "Detection" dev / "Prevention" prod

  managed_rule {
    type    = "DefaultRuleSet"
    version = "1.0"
    action  = "Block"
  }

  managed_rule {
    type    = "Microsoft_BotManagerRuleSet"
    version = "1.0"
    action  = "Block"
  }

  tags = var.tags
}

# ── Security Policy — WAF applied to endpoint and all custom domains ──────────

resource "azurerm_cdn_frontdoor_security_policy" "this" {
  name                     = "secp-${var.prefix}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id

  security_policies {
    firewall {
      cdn_frontdoor_firewall_policy_id = azurerm_cdn_frontdoor_firewall_policy.this.id

      association {
        domain {
          cdn_frontdoor_domain_id = azurerm_cdn_frontdoor_endpoint.this.id
        }
        patterns_to_match = ["/*"]
      }

      association {
        domain {
          cdn_frontdoor_domain_id = azurerm_cdn_frontdoor_custom_domain.web.id
        }
        patterns_to_match = ["/*"]
      }

      association {
        domain {
          cdn_frontdoor_domain_id = azurerm_cdn_frontdoor_custom_domain.api.id
        }
        patterns_to_match = ["/*"]
      }
    }
  }
}
