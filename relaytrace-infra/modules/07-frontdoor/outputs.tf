# ── Front Door Profile ────────────────────────────────────────────────────────

output "frontdoor_profile_id" {
  description = "Resource ID of the Front Door profile. Use as the X-Azure-FDID header value when restricting App Service access."
  value       = azurerm_cdn_frontdoor_profile.this.id
}

output "frontdoor_endpoint_hostname" {
  description = "Default Front Door hostname (*.azurefd.net). Available immediately without DNS setup."
  value       = azurerm_cdn_frontdoor_endpoint.this.host_name
}

# ── Custom Domain URLs ────────────────────────────────────────────────────────

output "web_url" {
  description = "Public URL for the Web app (active after DNS validation)."
  value       = "https://${var.web_custom_domain}"
}

output "api_url" {
  description = "Public URL for the API (active after DNS validation)."
  value       = "https://${var.api_custom_domain}"
}

# ── DNS Records for registrar ─────────────────────────────────────────────────
# Run: terraform output frontdoor_dns_records
# Add ALL records to your DNS registrar before verifying domains in Azure Portal.
#
# For each domain you need:
#   CNAME  {subdomain}           →  {frontdoor_endpoint_hostname}
#   TXT    _dnsauth.{subdomain}  →  {validation_token}

output "frontdoor_dns_records" {
  description = "DNS records to add to your registrar for each custom domain."
  value = {
    web = {
      cname = {
        name  = var.web_custom_domain
        type  = "CNAME"
        value = azurerm_cdn_frontdoor_endpoint.this.host_name
        ttl   = 3600
      }
      txt_validation = {
        name  = "_dnsauth.${replace(var.web_custom_domain, ".${join(".", slice(split(".", var.web_custom_domain), 1, length(split(".", var.web_custom_domain))))}", "")}"
        type  = "TXT"
        value = azurerm_cdn_frontdoor_custom_domain.web.validation_token
        ttl   = 3600
      }
    }
    api = {
      cname = {
        name  = var.api_custom_domain
        type  = "CNAME"
        value = azurerm_cdn_frontdoor_endpoint.this.host_name
        ttl   = 3600
      }
      txt_validation = {
        name  = "_dnsauth.${replace(var.api_custom_domain, ".${join(".", slice(split(".", var.api_custom_domain), 1, length(split(".", var.api_custom_domain))))}", "")}"
        type  = "TXT"
        value = azurerm_cdn_frontdoor_custom_domain.api.validation_token
        ttl   = 3600
      }
    }
  }
}
