# ══════════════════════════════════════════════════════════════════════════════
# Next.js Web — app-web-{prefix}
# ══════════════════════════════════════════════════════════════════════════════

resource "azurerm_linux_web_app" "web" {
  name                = "app-web-${var.prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.this.id

  virtual_network_subnet_id = var.subnet_appservice_id
  https_only                = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on              = var.always_on
    http2_enabled          = true
    minimum_tls_version    = "1.2"
    ftps_state             = "Disabled"
    vnet_route_all_enabled = true

    application_stack {
      docker_image_name   = "${var.dockerhub_username}/${var.web_image_name}:${var.web_image_tag}"
      docker_registry_url = "https://index.docker.io"
    }
  }

  app_settings = {
    # ── Runtime ───────────────────────────────────────────────────────────────
    "NODE_ENV"      = "production"
    "PORT"          = tostring(var.web_port)
    "WEBSITES_PORT" = tostring(var.web_port)

    # ── API URL ───────────────────────────────────────────────────────────────
    # NEXTJS_API_URL   → server runtime (Server Components, API routes).
    # NEXT_PUBLIC_API_URL must be baked into the Docker image at build time.
    # These point to the Front Door URL when var.api_public_url is set,
    # otherwise fall back to the App Service default hostname.
    "NEXTJS_API_URL"      = var.api_public_url != "" ? var.api_public_url : "https://app-api-${var.prefix}.azurewebsites.net"
    "NEXT_PUBLIC_API_URL" = var.api_public_url != "" ? var.api_public_url : "https://app-api-${var.prefix}.azurewebsites.net"

    # ── Docker ────────────────────────────────────────────────────────────────
    "DOCKER_ENABLE_CI" = "true"

    # ── Observability ─────────────────────────────────────────────────────────
    # Docker does not resolve @Microsoft.KeyVault() references, fetch actual value.
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = data.azurerm_key_vault_secret.appinsights_connection_string.value
  }

  tags = var.tags
}
