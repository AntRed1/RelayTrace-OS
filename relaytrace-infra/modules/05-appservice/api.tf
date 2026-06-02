# ══════════════════════════════════════════════════════════════════════════════
# NestJS API — app-api-{prefix}
# ══════════════════════════════════════════════════════════════════════════════

locals {
  # Shorthand for building Key Vault reference strings.
  # Format: @Microsoft.KeyVault(VaultName=kv-name;SecretName=secret-name)
  kv = "VaultName=${var.key_vault_name};SecretName"
}

# Data sources — only for secrets that exist BEFORE this module runs
# (created by module.keyvault and module.data in earlier dependency chain).
# Secrets created in the same apply (storage, acs, appinsights) are passed
# as plain variables from main.tf to avoid plan-time "secret not found" errors.

data "azurerm_key_vault_secret" "mysql_connection_string" {
  name         = "mysql-connection-string"
  key_vault_id = var.key_vault_id
}

data "azurerm_key_vault_secret" "jwt_access_secret" {
  name         = "jwt-access-secret"
  key_vault_id = var.key_vault_id
}

data "azurerm_key_vault_secret" "jwt_refresh_secret" {
  name         = "jwt-refresh-secret"
  key_vault_id = var.key_vault_id
}

data "azurerm_key_vault_secret" "stripe_secret_key" {
  name         = "stripe-secret-key"
  key_vault_id = var.key_vault_id
}

data "azurerm_key_vault_secret" "stripe_webhook_secret" {
  name         = "stripe-webhook-secret"
  key_vault_id = var.key_vault_id
}

data "azurerm_key_vault_secret" "redis_host" {
  name         = "redis-host"
  key_vault_id = var.key_vault_id
}

data "azurerm_key_vault_secret" "redis_password" {
  name         = "redis-password"
  key_vault_id = var.key_vault_id
}

resource "azurerm_linux_web_app" "api" {
  name                = "app-api-${var.prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.this.id

  # Delegate all outbound traffic through snet-appservice into the VNet.
  virtual_network_subnet_id = var.subnet_appservice_id
  https_only                = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on                         = var.always_on
    http2_enabled                     = true
    minimum_tls_version               = "1.2"
    ftps_state                        = "Disabled"
    vnet_route_all_enabled            = true # Route ALL egress through VNet
    health_check_path                 = var.api_health_check_path
    health_check_eviction_time_in_min = 10

    # Apply pending Prisma migrations before booting the API.
    # `migrate deploy` is idempotent (only applies un-applied migrations) and
    # acquires a DB advisory lock, so concurrent instances are safe. Requires
    # the Prisma CLI + prisma.config.ts to be present in the image (see Dockerfile).
    # app_command_line = "sh -c 'npx prisma migrate deploy && node dist/src/main.js'" # Migrations are now run as a separate startup command in module 07 to ensure they run before the app starts.
    application_stack {
      docker_image_name   = "${var.dockerhub_username}/${var.api_image_name}:${var.api_image_tag}"
      docker_registry_url = "https://index.docker.io"
    }

    # Allow requests from the Web app. Updated to the Front Door URL in module 07.
    cors {
      allowed_origins     = ["https://app-web-${var.prefix}.azurewebsites.net"]
      support_credentials = true
    }
  }

  app_settings = {
    # ── Runtime ───────────────────────────────────────────────────────────────
    "NODE_ENV"      = "production"
    "PORT"          = tostring(var.api_port)
    "WEBSITES_PORT" = tostring(var.api_port)

    # ── Secrets (read from Key Vault via data sources for Docker) ───────────────
    # Docker does not resolve @Microsoft.KeyVault() references, so we fetch
    # actual secret values and pass them as environment variables.
    "DATABASE_URL"               = data.azurerm_key_vault_secret.mysql_connection_string.value
    "JWT_SECRET"                 = data.azurerm_key_vault_secret.jwt_access_secret.value
    "JWT_REFRESH_SECRET"         = data.azurerm_key_vault_secret.jwt_refresh_secret.value
    "STRIPE_SECRET_KEY"          = data.azurerm_key_vault_secret.stripe_secret_key.value
    "STRIPE_WEBHOOK_SECRET"      = data.azurerm_key_vault_secret.stripe_webhook_secret.value
    "AZURE_STORAGE_ACCOUNT_NAME" = var.storage_account_name

    # ── Redis ─────────────────────────────────────────────────────────────────
    # API reads discrete host/port/password (ioredis + BullMQ), not a URL.
    # Azure Cache for Redis is TLS-only on 6380 → REDIS_TLS enables ioredis tls.
    "REDIS_HOST"     = data.azurerm_key_vault_secret.redis_host.value
    "REDIS_PORT"     = "6380"
    "REDIS_PASSWORD" = data.azurerm_key_vault_secret.redis_password.value
    "REDIS_TLS"      = "true"

    # ── Communication (ACS Email) ─────────────────────────────────────────────
    "ACS_CONNECTION_STRING" = var.acs_connection_string
    "ACS_FROM_ADDRESS"      = var.acs_from_address

    # ── Storage containers (not sensitive — plain values) ─────────────────────
    "AZURE_STORAGE_CONTAINER_SCREENSHOTS" = var.container_screenshots
    "AZURE_STORAGE_CONTAINER_OCR"         = var.container_ocr_documents
    "AZURE_STORAGE_CONTAINER_EXPORTS"     = var.container_exports

    # ── Stripe Price IDs (not sensitive — plain values) ──────────────────────
    "STRIPE_PRICE_STARTER" = var.stripe_price_starter
    "STRIPE_PRICE_GROWTH"  = var.stripe_price_growth

    # ── Application URL (used in outbound email links) ────────────────────────
    "APP_URL" = var.web_custom_domain != "" ? "https://${var.web_custom_domain}" : "https://app-web-${var.prefix}.azurewebsites.net"

    # ── CORS (allows the web app through the NestJS CORS middleware) ──────────
    "ALLOWED_ORIGINS" = var.web_custom_domain != "" ? "https://${var.web_custom_domain},https://app-web-${var.prefix}.azurewebsites.net" : "https://app-web-${var.prefix}.azurewebsites.net"

    # ── Docker ────────────────────────────────────────────────────────────────
    # Enables webhook-based continuous deployment from Docker Hub.
    "DOCKER_ENABLE_CI" = "true"

    # ── Observability ─────────────────────────────────────────────────────────
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.appinsights_connection_string
  }

  tags = var.tags
}

# ── RBAC: API app → Key Vault Secrets User ────────────────────────────────────
# Grants the API's Managed Identity permission to resolve Key Vault references.

resource "azurerm_role_assignment" "api_kv_secrets_user" {
  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_web_app.api.identity[0].principal_id
}

# ── RBAC: API app → Storage Blob Data Contributor ─────────────────────────────
# Grants the API's Managed Identity read/write access to all blob containers.

resource "azurerm_role_assignment" "api_storage_blob" {
  scope                = var.storage_account_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_web_app.api.identity[0].principal_id
}
