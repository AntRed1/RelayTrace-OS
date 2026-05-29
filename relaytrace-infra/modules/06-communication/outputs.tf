# ── Communication Service ─────────────────────────────────────────────────────

output "communication_service_id" {
  description = "Resource ID of the Azure Communication Service."
  value       = azurerm_communication_service.this.id
}

output "communication_service_name" {
  description = "Name of the Azure Communication Service."
  value       = azurerm_communication_service.this.name
}

# ── Email Domain ──────────────────────────────────────────────────────────────

output "email_domain" {
  description = "The configured email sending domain."
  value       = azurerm_email_communication_service_domain.this.name
}

output "email_domain_id" {
  description = "Resource ID of the email domain."
  value       = azurerm_email_communication_service_domain.this.id
}

# ── DNS Verification Records ──────────────────────────────────────────────────
# Run: terraform output dns_verification_records
# Add each record to your DNS registrar, then verify the domain in the Portal.
#
# Expected records:
#   domain  → TXT  @  (domain ownership proof)
#   spf     → TXT  @  v=spf1 include:spf.protection.outlook.com -all
#   dkim    → CNAME selector1._domainkey
#   dkim2   → CNAME selector2._domainkey

output "dns_verification_records" {
  description = "DNS records required to verify the sending domain. Add these to your registrar, then verify in the Azure Portal."
  value       = azurerm_email_communication_service_domain.this.verification_records
}

# ── Key Vault secret URI ──────────────────────────────────────────────────────

output "secret_uri_acs_connection_string" {
  description = "Versionless Key Vault URI for the acs-connection-string secret."
  value       = azurerm_key_vault_secret.acs_connection_string.versionless_id
}
