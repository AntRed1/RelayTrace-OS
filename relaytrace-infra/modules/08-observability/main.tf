# ══════════════════════════════════════════════════════════════════════════════
# Module: 08-observability
#
# Handles the observability stack for RelayTrace OS:
#
#   Log Analytics Workspace  — created in root main.tf, ID passed as input
#   Application Insights     — created in root main.tf, ID passed as input
#
# NOTE: AppInsights and Log Analytics are created BEFORE module.app_service
# in main.tf to break the circular dependency:
#   module.observability needs app IDs (from module.app_service)
#   module.app_service needs appinsights_connection_string
#
# This module handles:
#   - Writing AppInsights connection string to Key Vault
#   - Diagnostic settings for all resources (App Service, MySQL, Redis, Storage, KV)
#
# ══════════════════════════════════════════════════════════════════════════════
