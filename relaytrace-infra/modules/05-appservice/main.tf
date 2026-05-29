# ══════════════════════════════════════════════════════════════════════════════
# Module: 05-appservice
#
# Provisions the App Service tier for RelayTrace OS:
#
#   App Service Plan (Linux P1v3) — shared by both apps
#   app-api-{prefix}   NestJS API   — Docker Hub public image
#   app-web-{prefix}   Next.js Web  — Docker Hub public image
#
# Both apps:
#   - VNet Integration into snet-appservice (all egress routes through VNet)
#   - System-assigned Managed Identity
#   - HTTPS-only, TLS 1.2, HTTP/2, FTPS disabled
#
# API app extra:
#   - Key Vault references for all secrets (MSI resolves them at startup)
#   - Storage Blob Data Contributor RBAC on the Storage Account
#   - CORS configured for the Web app default hostname
#
# Note — NEXT_PUBLIC_* variables:
#   Next.js inlines NEXT_PUBLIC_* at BUILD time. The image on Docker Hub must
#   be built with the correct NEXT_PUBLIC_API_URL baked in.
#   NEXTJS_API_URL (no prefix) is available at server runtime and can be used
#   in Server Components / API routes without a rebuild.
# ══════════════════════════════════════════════════════════════════════════════

# ── App Service Plan ──────────────────────────────────────────────────────────
# P1v3 is the minimum Premium v3 SKU that supports Regional VNet Integration
# on Linux. Both apps run on this single plan (shared compute).

resource "azurerm_service_plan" "this" {
  name                = "asp-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = var.app_service_sku
  tags                = var.tags
}
