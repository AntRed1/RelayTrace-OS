# ══════════════════════════════════════════════════════════════════════════════
# Module: 06-communication
#
# Provisions the Azure Communication Services (ACS) Email stack:
#
#   Email Communication Service   — email infrastructure resource
#   Email Domain (CustomerManaged)— verifies var.email_domain for sending
#   Communication Service          — programmatic endpoint + connection string
#
# No Private Endpoint is created for ACS: email traffic flows from the app
# to the public ACS HTTPS endpoint (allowed by the nsg-appservice
# Allow-Outbound-Internet-HTTPS rule), then on to Microsoft's SMTP
# infrastructure. The connection string is stored in Key Vault and
# resolved by the API's Managed Identity at startup.
#
# ─── Post-apply manual steps ──────────────────────────────────────────────────
#  1. Run: terraform output dns_verification_records
#     Add the returned TXT (domain), TXT (SPF), and CNAME×2 (DKIM) records
#     to your DNS registrar for var.email_domain.
#  2. In the Azure Portal → Email Communication Service → Domains →
#     verify the domain (triggers DNS check).
#  3. In the Azure Portal → Communication Service → Connected domains →
#     link the verified email domain.
#  4. Add sender usernames (e.g. noreply, support) via the Portal.
# ══════════════════════════════════════════════════════════════════════════════

# ── Email Communication Service ───────────────────────────────────────────────
# Global resource — data_location controls where Azure stores email metadata.

resource "azurerm_email_communication_service" "this" {
  name                = "ecs-${var.prefix}"
  resource_group_name = var.resource_group_name
  data_location       = var.data_location
  tags                = var.tags
}

# ── Custom Email Domain ───────────────────────────────────────────────────────
# Verification DNS records are exposed as outputs; add them to your registrar
# before verifying the domain in the Portal.

resource "azurerm_email_communication_service_domain" "this" {
  name             = var.email_domain
  email_service_id = azurerm_email_communication_service.this.id

  domain_management = "CustomerManaged"

  # user_engagement_tracking_disabled is not in the azurerm provider schema.
  # Configure tracking via Portal → Email domain → Tracking settings after apply.

  tags = var.tags
}

# ── Communication Service ─────────────────────────────────────────────────────
# Provides the connection string used by the NestJS @azure/communication-email
# SDK. The primary_connection_string is stored in Key Vault by secrets.tf.

resource "azurerm_communication_service" "this" {
  name                = "acs-${var.prefix}"
  resource_group_name = var.resource_group_name
  data_location       = var.data_location
  tags                = var.tags
}
