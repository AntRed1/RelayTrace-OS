variable "prefix"               { type = string }
variable "location"             { type = string }
variable "resource_group_name"  { type = string }

# Key Vault — module 02
variable "key_vault_id" {
  description = "Resource ID of the Key Vault (used for writing AppInsights secret and diagnostic settings)."
  type        = string
}

# Resource IDs for diagnostic settings — modules 03, 04, 05
variable "api_app_id"        { type = string }
variable "web_app_id"        { type = string }
variable "mysql_server_id"   { type = string }
variable "redis_id"          { type = string }
variable "storage_account_id"{ type = string }

# Workspace settings
variable "retention_days" {
  description = "Log retention in days. Min 30, max 730. Use 30 for dev, 90 for prod."
  type        = number
  default     = 30
  validation {
    condition     = var.retention_days >= 30 && var.retention_days <= 730
    error_message = "retention_days must be between 30 and 730."
  }
}

variable "daily_quota_gb" {
  description = "Daily log ingestion cap in GB. Prevents unexpected cost spikes. Use -1 for unlimited."
  type        = number
  default     = 1  # 1 GB/day — raise for prod
}

variable "tags" {
  type    = map(string)
  default = {}
}
