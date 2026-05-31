variable "prefix" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }

# Networking — module 01
variable "subnet_appservice_id" { type = string }

# Key Vault — module 02
variable "key_vault_id" { type = string }
variable "key_vault_name" { type = string }

# Storage — module 04
variable "storage_account_id" { type = string }
variable "container_screenshots" { type = string }
variable "container_ocr_documents" { type = string }
variable "container_exports" { type = string }

# ── App Service Plan ──────────────────────────────────────────────────────────

variable "app_service_sku" {
  description = "App Service Plan SKU. Must be Premium v2/v3 for Linux VNet Integration."
  type        = string
  default     = "P1v3"
}

variable "always_on" {
  description = "Keep apps warm (always on). Set false for dev to reduce costs."
  type        = bool
  default     = true
}

# ── Docker Hub ────────────────────────────────────────────────────────────────

variable "dockerhub_username" {
  description = "Docker Hub username or organisation that owns the images."
  type        = string
}

variable "api_image_name" {
  description = "Docker Hub image name for the NestJS API."
  type        = string
  default     = "relaytrace-api"
}

variable "api_image_tag" {
  description = "Docker Hub image tag for the NestJS API."
  type        = string
  default     = "latest"
}

variable "web_image_name" {
  description = "Docker Hub image name for the Next.js Web app."
  type        = string
  default     = "relaytrace-web"
}

variable "web_image_tag" {
  description = "Docker Hub image tag for the Next.js Web app."
  type        = string
  default     = "latest"
}

# ── Ports ─────────────────────────────────────────────────────────────────────

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

variable "api_public_url" {
  description = "Public API URL via Front Door (e.g. https://api.relaytrace.com). Leave empty to use default App Service hostname."
  type        = string
  default     = ""
}

variable "web_custom_domain" {
  description = "Web custom domain (e.g. www.relaytrace.com). Used to build APP_URL and ALLOWED_ORIGINS."
  type        = string
  default     = ""
}

variable "stripe_price_starter" {
  description = "Stripe Price ID for the Starter plan (recurring monthly)."
  type        = string
  default     = ""
}

variable "stripe_price_growth" {
  description = "Stripe Price ID for the Growth plan (recurring monthly)."
  type        = string
  default     = ""
}

variable "acs_from_address" {
  description = "Full email address used as sender (e.g. noreply@mail.relaytrace.com)."
  type        = string
  default     = ""
}

variable "api_health_check_path" {
  description = "HTTP path App Service polls to determine API health. The API mounts routes under the global prefix + URI version (api/v1)."
  type        = string
  default     = "/api/v1/health"
}

variable "tags" {
  type    = map(string)
  default = {}
}
