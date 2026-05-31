variable "prefix" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }

# Networking — provided by module 01
variable "vnet_id" { type = string }
variable "subnet_private_id" { type = string }

# Key Vault hardening
variable "purge_protection_enabled" {
  description = "Enable purge protection. Set true for prod — cannot be undone."
  type        = bool
  default     = false
}

variable "ci_runner_ips" {
  description = "Public IPs of CI runners / developer machines allowed to reach Key Vault during terraform apply. Safe to leave empty if default_action stays Allow."
  type        = list(string)
  default     = []
}

# Application secrets — NEVER commit values to git.
# Supply via: export TF_VAR_stripe_secret_key="..."
variable "stripe_secret_key" {
  description = "Stripe secret API key (sk_live_... or sk_test_...)."
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret (whsec_...)."
  type        = string
  sensitive   = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
