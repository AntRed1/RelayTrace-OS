# ══════════════════════════════════════════════════════════════════════════════
# Secrets
#
# All azurerm_key_vault_secret resources depend on the RBAC role assignment so
# that the Terraform principal has write permission before the first PUT.
# ══════════════════════════════════════════════════════════════════════════════

# ── Random password generators ────────────────────────────────────────────────

# MySQL admin password — stored here, consumed by module 03 (data).
resource "random_password" "mysql_admin" {
  length           = 20
  special          = true
  override_special = "!#%-_" # solo chars seguros en URLs sin encoding
  min_upper        = 2
  min_lower        = 2
  min_numeric      = 2
  min_special      = 2
}

# JWT signing keys — 64-char alphanumeric (no escaping issues in env vars).
resource "random_password" "jwt_access" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh" {
  length  = 64
  special = false
}

# ── Key Vault secrets: generated ─────────────────────────────────────────────

resource "azurerm_key_vault_secret" "mysql_admin_password" {
  name         = "mysql-admin-password"
  value        = random_password.mysql_admin.result
  key_vault_id = azurerm_key_vault.this.id
  content_type = "text/plain"
  tags         = var.tags

  depends_on = [azurerm_role_assignment.terraform_secrets_officer]
}

resource "azurerm_key_vault_secret" "jwt_access_secret" {
  name         = "jwt-access-secret"
  value        = random_password.jwt_access.result
  key_vault_id = azurerm_key_vault.this.id
  content_type = "text/plain"
  tags         = var.tags

  depends_on = [azurerm_role_assignment.terraform_secrets_officer]
}

resource "azurerm_key_vault_secret" "jwt_refresh_secret" {
  name         = "jwt-refresh-secret"
  value        = random_password.jwt_refresh.result
  key_vault_id = azurerm_key_vault.this.id
  content_type = "text/plain"
  tags         = var.tags

  depends_on = [azurerm_role_assignment.terraform_secrets_officer]
}

# ── Key Vault secrets: passed in as sensitive variables ───────────────────────
# Do NOT put these values in .tfvars files committed to git.
# Pass via environment variables:
#   export TF_VAR_stripe_secret_key="sk_live_..."
#   export TF_VAR_stripe_webhook_secret="whsec_..."

resource "azurerm_key_vault_secret" "stripe_secret_key" {
  name         = "stripe-secret-key"
  value        = var.stripe_secret_key
  key_vault_id = azurerm_key_vault.this.id
  content_type = "text/plain"
  tags         = var.tags

  depends_on = [azurerm_role_assignment.terraform_secrets_officer]
}

resource "azurerm_key_vault_secret" "stripe_webhook_secret" {
  name         = "stripe-webhook-secret"
  value        = var.stripe_webhook_secret
  key_vault_id = azurerm_key_vault.this.id
  content_type = "text/plain"
  tags         = var.tags

  depends_on = [azurerm_role_assignment.terraform_secrets_officer]
}

# ── Placeholders populated by later modules ───────────────────────────────────
# redis-host                → module 03 (data)
# redis-password            → module 03 (data)
# mysql-connection-string   → module 03 (data)
# acs-connection-string     → module 06 (communication)
