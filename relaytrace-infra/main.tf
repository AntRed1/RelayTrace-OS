# ── Local helpers ──────────────────────────────────────────────────────────────

locals {
  prefix = "${var.project}-${var.environment}"

  common_tags = merge(var.tags, {
    project     = var.project
    environment = var.environment
    managed_by  = "terraform"
  })
}

# ── Resource Group ─────────────────────────────────────────────────────────────
# Single RG for all app resources. The tfstate RG is created manually (bootstrap).

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.prefix}"
  location = var.location
  tags     = local.common_tags
}

# ── Module 01 — Networking ─────────────────────────────────────────────────────

module "networking" {
  source = "./modules/01-networking"

  prefix                   = local.prefix
  location                 = var.location
  resource_group_name      = azurerm_resource_group.main.name
  vnet_address_space       = var.vnet_address_space
  subnet_appservice_prefix = var.subnet_appservice_prefix
  subnet_data_prefix       = var.subnet_data_prefix
  subnet_mysql_prefix      = var.subnet_mysql_prefix
  subnet_private_prefix    = var.subnet_private_prefix
  tags                     = local.common_tags
}

# ── Module 02 — Key Vault ──────────────────────────────────────────────────────

module "keyvault" {
  source = "./modules/02-keyvault"

  prefix              = local.prefix
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  vnet_id             = module.networking.vnet_id
  subnet_private_id   = module.networking.subnet_private_id

  purge_protection_enabled = var.keyvault_purge_protection
  ci_runner_ips            = var.ci_runner_ips

  stripe_secret_key     = var.stripe_secret_key
  stripe_webhook_secret = var.stripe_webhook_secret

  tags = local.common_tags
}

# ── Module 03 — Data (MySQL Flexible Server + Redis) ──────────────────────────

module "data" {
  source = "./modules/03-data"

  prefix              = local.prefix
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name

  vnet_id         = module.networking.vnet_id
  subnet_mysql_id = module.networking.subnet_mysql_id
  subnet_data_id  = module.networking.subnet_data_id

  key_vault_id = module.keyvault.key_vault_id

  mysql_admin_username        = var.mysql_admin_username
  mysql_admin_password        = module.keyvault.mysql_admin_password
  mysql_db_name               = var.mysql_db_name
  mysql_backup_retention_days = var.mysql_backup_retention_days

  redis_sku_name = var.redis_sku_name
  redis_capacity = var.redis_capacity

  tags = local.common_tags
}

# ── Module 04 — Storage ────────────────────────────────────────────────────────

module "storage" {
  source = "./modules/04-storage"

  prefix              = local.prefix
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name

  vnet_id           = module.networking.vnet_id
  subnet_private_id = module.networking.subnet_private_id

  key_vault_id = module.keyvault.key_vault_id

  storage_replication_type      = var.storage_replication_type
  storage_public_access_enabled = var.storage_public_access_enabled
  blob_soft_delete_days         = var.blob_soft_delete_days

  tags = local.common_tags
}

# ── Module 05 — App Service ────────────────────────────────────────────────────

module "app_service" {
  source = "./modules/05-appservice"

  prefix              = local.prefix
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name

  # Networking
  subnet_appservice_id = module.networking.subnet_appservice_id

  # Key Vault
  key_vault_id   = module.keyvault.key_vault_id
  key_vault_name = module.keyvault.key_vault_name

  # Storage
  storage_account_id      = module.storage.storage_account_id
  container_screenshots   = module.storage.container_screenshots
  container_ocr_documents = module.storage.container_ocr_documents
  container_exports       = module.storage.container_exports

  # Plan & images
  app_service_sku    = var.app_service_sku
  always_on          = var.always_on
  dockerhub_username = var.dockerhub_username
  api_image_name     = var.api_image_name
  api_image_tag      = var.api_image_tag
  web_image_name     = var.web_image_name
  web_image_tag      = var.web_image_tag
  api_port           = var.api_port
  web_port           = var.web_port

  acs_from_address     = var.acs_from_address
  api_public_url       = "https://${var.api_custom_domain}"
  web_custom_domain    = var.web_custom_domain
  stripe_price_starter = var.stripe_price_starter
  stripe_price_growth  = var.stripe_price_growth

  tags = local.common_tags
}

# ── Module 06 — Communication (ACS Email) ─────────────────────────────────────

module "communication" {
  source = "./modules/06-communication"

  prefix              = local.prefix
  resource_group_name = azurerm_resource_group.main.name

  key_vault_id = module.keyvault.key_vault_id

  data_location     = var.acs_data_location
  email_domain      = var.email_domain
  tracking_disabled = var.email_tracking_disabled

  tags = local.common_tags
}

# ── Module 07 — Front Door ─────────────────────────────────────────────────────

module "frontdoor" {
  source = "./modules/07-frontdoor"

  prefix              = local.prefix
  resource_group_name = azurerm_resource_group.main.name

  api_app_hostname = module.app_service.api_default_hostname
  web_app_hostname = module.app_service.web_default_hostname

  web_custom_domain = var.web_custom_domain
  api_custom_domain = var.api_custom_domain
  waf_mode          = var.waf_mode
  frontdoor_sku     = var.frontdoor_sku

  tags = local.common_tags
}

# ── Module 08 — Observability ──────────────────────────────────────────────────

module "observability" {
  source = "./modules/08-observability"

  prefix              = local.prefix
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name

  # Key Vault — for writing AppInsights secret
  key_vault_id = module.keyvault.key_vault_id

  # Resource IDs for diagnostic settings
  api_app_id         = module.app_service.api_app_id
  web_app_id         = module.app_service.web_app_id
  mysql_server_id    = module.data.mysql_server_id
  redis_id           = module.data.redis_id
  storage_account_id = module.storage.storage_account_id

  retention_days = var.log_retention_days
  daily_quota_gb = var.log_daily_quota_gb

  tags = local.common_tags
}
