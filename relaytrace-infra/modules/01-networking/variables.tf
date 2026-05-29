variable "prefix"               { type = string }
variable "location"             { type = string }
variable "resource_group_name"  { type = string }
variable "vnet_address_space"   { type = string }

variable "subnet_appservice_prefix" { type = string }
variable "subnet_data_prefix"       { type = string }
variable "subnet_mysql_prefix"      { type = string }
variable "subnet_private_prefix"    { type = string }

variable "tags" {
  type    = map(string)
  default = {}
}
