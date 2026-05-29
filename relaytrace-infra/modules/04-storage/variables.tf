variable "prefix"               { type = string }
variable "location"             { type = string }
variable "resource_group_name"  { type = string }

# Networking — provided by module 01
variable "vnet_id"          { type = string }
variable "subnet_private_id" { type = string }

# Key Vault — provided by module 02
variable "key_vault_id" {
  description = "Resource ID of the Key Vault where the storage account name will be written."
  type        = string
}

# Storage account settings
variable "storage_replication_type" {
  description = "Storage replication strategy. LRS for dev, ZRS or GRS for prod."
  type        = string
  default     = "LRS"
  validation {
    condition     = contains(["LRS", "ZRS", "GRS", "GZRS", "RAGRS", "RAGZRS"], var.storage_replication_type)
    error_message = "storage_replication_type must be LRS, ZRS, GRS, GZRS, RAGRS, or RAGZRS."
  }
}

variable "storage_public_access_enabled" {
  description = "Allow public network access to the storage account. Keep true during bootstrap; set false after the Private Endpoint is active."
  type        = bool
  default     = true
}

variable "blob_soft_delete_days" {
  description = "Days to retain soft-deleted blobs and containers (1–365)."
  type        = number
  default     = 7
  validation {
    condition     = var.blob_soft_delete_days >= 1 && var.blob_soft_delete_days <= 365
    error_message = "blob_soft_delete_days must be between 1 and 365."
  }
}

variable "tags" {
  type    = map(string)
  default = {}
}
