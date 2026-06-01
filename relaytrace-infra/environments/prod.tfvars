project     = "relaytrace"
environment = "prod"
location    = "westus2"

# Networking
vnet_address_space       = "10.0.0.0/16"
subnet_appservice_prefix = "10.0.1.0/24"
subnet_data_prefix       = "10.0.2.0/24"
subnet_mysql_prefix      = "10.0.3.0/24"
subnet_private_prefix    = "10.0.4.0/24"

# Key Vault
keyvault_purge_protection = true
# ci_runner_ips = ["your.ci.runner.ip/32"]  # Uncomment to restrict KV network access

# stripe_secret_key     → TF_VAR_stripe_secret_key
# stripe_webhook_secret → TF_VAR_stripe_webhook_secret

# MySQL
mysql_admin_username        = "rtadmin"
mysql_db_name               = "relaytrace"
mysql_backup_retention_days = 7

# Redis
redis_sku_name = "Standard"
redis_capacity = 1 # C1 = 1 GB, SLA, replication

# Front Door
web_root_domain   = "relaytrace.net"
web_custom_domain = "www.relaytrace.net"
api_custom_domain = "api.relaytrace.net"
frontdoor_sku     = "Standard_AzureFrontDoor" # Upgrade to Premium_AzureFrontDoor when managed WAF rules are needed
waf_mode          = "Prevention"

# Communication (ACS Email)
email_domain            = "mail.relaytrace.net"
acs_from_address        = "noreply@mail.relaytrace.net"
acs_data_location       = "United States"
email_tracking_disabled = true

# App Service
app_service_sku    = "P1v3"
always_on          = true
dockerhub_username   = "antred1"
stripe_price_starter = "price_1TbWQaLWZ1WnUhF7aJUVxGY9"
stripe_price_growth  = "price_1TbWQlLWZ1WnUhF7XgcF5hRe"
api_image_name       = "relaytrace-api"
api_image_tag      = "latest"
web_image_name     = "relaytrace-web"
web_image_tag      = "latest"
api_port           = 3000
web_port           = 3000

# Storage
storage_replication_type      = "ZRS"
storage_public_access_enabled = true # Set false after first apply + PE verified
blob_soft_delete_days         = 14

# Observability
log_retention_days = 90
log_daily_quota_gb = 5 # 5 GB/day cap in prod — raise if needed

tags = {
  owner       = "relaytrace-team"
  cost_center = "engineering"
}
