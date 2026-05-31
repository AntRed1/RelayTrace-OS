variable "prefix" { type = string }
variable "resource_group_name" { type = string }

# App Service hostnames — provided by module 05
variable "api_app_hostname" {
  description = "Default hostname of the NestJS API app (no https://)."
  type        = string
}

variable "web_app_hostname" {
  description = "Default hostname of the Next.js Web app (no https://)."
  type        = string
}

# Custom domains
variable "web_custom_domain" {
  description = "Custom domain for the Web app (e.g. www.relaytrace.com)."
  type        = string
  default     = "www.relaytrace.com"
}

variable "api_custom_domain" {
  description = "Custom domain for the API (e.g. api.relaytrace.com)."
  type        = string
  default     = "api.relaytrace.com"
}

# WAF
variable "waf_mode" {
  description = "WAF mode: Detection (log only) for dev, Prevention (block) for prod."
  type        = string
  default     = "Detection"
  validation {
    condition     = contains(["Detection", "Prevention"], var.waf_mode)
    error_message = "waf_mode must be Detection or Prevention."
  }
}

variable "tags" {
  type    = map(string)
  default = {}
}
