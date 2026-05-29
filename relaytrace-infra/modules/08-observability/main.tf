# ══════════════════════════════════════════════════════════════════════════════
# Module: 08-observability
#
# Provisions the full observability stack for RelayTrace OS:
#
#   Log Analytics Workspace  — central log store, PerGB2018 billing
#   Application Insights     — APM, distributed traces, live metrics, alerts
#
# Both App Service apps are configured to send telemetry via the
# APPLICATIONINSIGHTS_CONNECTION_STRING setting (KV reference, resolved by MSI).
#
# Diagnostic settings pipe resource logs + metrics to the workspace for:
#   App Service (API + Web), Key Vault, MySQL, Redis, Storage (blob)
#
# daily_quota_gb prevents runaway ingestion costs — raise in prod if needed.
# ══════════════════════════════════════════════════════════════════════════════

# ── Log Analytics Workspace ───────────────────────────────────────────────────

resource "azurerm_log_analytics_workspace" "this" {
  name                = "law-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = var.retention_days
  daily_quota_gb      = var.daily_quota_gb   # Cost guard — adjust per env
  tags                = var.tags
}

# ── Application Insights ──────────────────────────────────────────────────────
# Workspace-based instance — all telemetry lands in the Log Analytics workspace
# above, enabling unified KQL queries across app telemetry and resource logs.

resource "azurerm_application_insights" "this" {
  name                = "appi-${var.prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.this.id
  application_type    = "web"
  retention_in_days   = var.retention_days
  tags                = var.tags
}
