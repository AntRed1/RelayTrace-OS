variable "prefix"               { type = string }
variable "resource_group_name"  { type = string }

# Key Vault — module 02
variable "key_vault_id" {
  description = "Resource ID of the Key Vault where the ACS connection string will be written."
  type        = string
}

# ACS settings
variable "data_location" {
  description = "Data residency location for ACS and Email services. Must match your compliance requirements."
  type        = string
  default     = "United States"
}

variable "email_domain" {
  description = "Custom domain used for sending emails (e.g. mail.relaytrace.com). DNS records must be added to your registrar after apply."
  type        = string
}

variable "tracking_disabled" {
  description = "Disable open/click tracking in emails. Recommended true for B2B / GDPR compliance."
  type        = bool
  default     = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
