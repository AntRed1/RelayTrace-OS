# ── Project ────────────────────────────────────────────────────────────────────

variable "project" {
  description = "Short project identifier used as prefix in all resource names."
  type        = string
  default     = "relaytrace"
}

variable "environment" {
  description = "Deployment environment: dev | staging | prod"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Primary Azure region."
  type        = string
  default     = "westus2"
}

# ── Networking ─────────────────────────────────────────────────────────────────

variable "vnet_address_space" {
  description = "Address space for the Virtual Network."
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_appservice_prefix" {
  description = "CIDR for App Service VNet Integration subnet."
  type        = string
  default     = "10.0.1.0/24"
}

variable "subnet_data_prefix" {
  description = "CIDR for Redis Cache Private Endpoint subnet."
  type        = string
  default     = "10.0.2.0/24"
}

variable "subnet_mysql_prefix" {
  description = "CIDR for MySQL Flexible Server VNet Integration subnet."
  type        = string
  default     = "10.0.3.0/24"
}

variable "subnet_private_prefix" {
  description = "CIDR for Private Endpoints (Key Vault, Storage, ACS)."
  type        = string
  default     = "10.0.4.0/24"
}

# ── Key Vault ──────────────────────────────────────────────────────────────────

variable "keyvault_purge_protection" {
  description = "Enable Key Vault purge protection. Recommended true for prod — irreversible."
  type        = bool
  default     = false
}

variable "ci_runner_ips" {
  description = "Public IPs of CI runners / dev machines (used in KV network ACLs). Optional."
  type        = list(string)
  default     = []
}

# ── Application secrets ────────────────────────────────────────────────────────
# Do NOT set these in .tfvars files. Pass via environment variables:
#   export TF_VAR_stripe_secret_key="sk_live_..."
#   export TF_VAR_stripe_webhook_secret="whsec_..."

variable "stripe_secret_key" {
  description = "Stripe secret API key."
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret."
  type        = string
  sensitive   = true
}

variable "stripe_price_starter" {
  description = "Stripe Price ID for the Starter plan. Not sensitive — set in tfvars."
  type        = string
  default     = ""
}

variable "stripe_price_growth" {
  description = "Stripe Price ID for the Growth plan. Not sensitive — set in tfvars."
  type        = string
  default     = ""
}

# ── MySQL ──────────────────────────────────────────────────────────────────────

variable "mysql_admin_username" {
  description = "MySQL administrator login. Cannot be admin, root, or other reserved names."
  type        = string
  default     = "rtadmin"
}

variable "mysql_db_name" {
  description = "Application database name."
  type        = string
  default     = "relaytrace"
}

variable "mysql_backup_retention_days" {
  description = "Days to retain automated backups (1–35). Use 1 for dev, 7 for prod."
  type        = number
  default     = 7
}

# ── Redis ──────────────────────────────────────────────────────────────────────

variable "redis_sku_name" {
  description = "Redis SKU: Basic (dev, no SLA) or Standard (prod, SLA + replication)."
  type        = string
  default     = "Basic"
}

variable "redis_capacity" {
  description = "Redis cache capacity: 0 = C0 (250 MB), 1 = C1 (1 GB)."
  type        = number
  default     = 0
}

# ── App Service ────────────────────────────────────────────────────────────────

variable "app_service_sku" {
  description = "App Service Plan SKU. Must be Premium v2/v3 for Linux VNet Integration."
  type        = string
  default     = "P1v3"
}

variable "always_on" {
  description = "Keep apps warm. Set false for dev to reduce costs."
  type        = bool
  default     = true
}

variable "dockerhub_username" {
  description = "Docker Hub username or organisation that owns the RelayTrace images."
  type        = string
}

variable "api_image_name" {
  description = "Docker Hub image name for the NestJS API."
  type        = string
  default     = "relaytrace-api"
}

variable "api_image_tag" {
  description = "Docker image tag for the NestJS API."
  type        = string
  default     = "latest"
}

variable "web_image_name" {
  description = "Docker Hub image name for the Next.js Web app."
  type        = string
  default     = "relaytrace-web"
}

variable "web_image_tag" {
  description = "Docker image tag for the Next.js Web app."
  type        = string
  default     = "latest"
}

variable "api_port" {
  description = "Container port the NestJS API listens on."
  type        = number
  default     = 3000
}

variable "web_port" {
  description = "Container port the Next.js app listens on."
  type        = number
  default     = 3000
}

# ── Front Door ─────────────────────────────────────────────────────────────────

variable "web_custom_domain" {
  description = "Custom domain for the Web app."
  type        = string
  default     = "www.relaytrace.com"
}

variable "api_custom_domain" {
  description = "Custom domain for the API."
  type        = string
  default     = "api.relaytrace.com"
}

variable "frontdoor_sku" {
  description = "Front Door SKU. Standard_AzureFrontDoor for dev/cost-optimised. Premium_AzureFrontDoor for prod managed WAF rules."
  type        = string
  default     = "Standard_AzureFrontDoor"
}

variable "waf_mode" {
  description = "WAF mode: Detection (dev) or Prevention (prod)."
  type        = string
  default     = "Detection"
}

# ── Communication (ACS Email) ─────────────────────────────────────────────────

variable "email_domain" {
  description = "Domain used for sending emails (e.g. mail.relaytrace.com). DNS records must be added after apply."
  type        = string
  default     = "mail.relaytrace.com"
}

variable "acs_from_address" {
  description = "Full sender address (e.g. noreply@mail.relaytrace.com)."
  type        = string
  default     = "noreply@mail.relaytrace.com"
}

variable "acs_data_location" {
  description = "Data residency location for ACS (United States, Europe, etc.)."
  type        = string
  default     = "United States"
}

variable "email_tracking_disabled" {
  description = "Disable open/click tracking in emails. Recommended true for GDPR."
  type        = bool
  default     = true
}

# ── Storage ────────────────────────────────────────────────────────────────────

variable "storage_replication_type" {
  description = "Storage replication strategy. LRS for dev, ZRS for prod."
  type        = string
  default     = "LRS"
}

variable "storage_public_access_enabled" {
  description = "Allow public network access to Storage Account. Keep true during bootstrap; set false after PE is active."
  type        = bool
  default     = true
}

variable "blob_soft_delete_days" {
  description = "Days to retain soft-deleted blobs (1–365)."
  type        = number
  default     = 7
}

# ── Observability ──────────────────────────────────────────────────────────────

variable "log_retention_days" {
  description = "Log Analytics retention in days (30–730). Use 30 for dev, 90 for prod."
  type        = number
  default     = 30
}

variable "log_daily_quota_gb" {
  description = "Daily log ingestion cap in GB. Cost guard — use -1 for unlimited."
  type        = number
  default     = 1
}

# ── Tags ───────────────────────────────────────────────────────────────────────

variable "tags" {
  description = "Tags applied to every resource."
  type        = map(string)
  default     = {}
}
