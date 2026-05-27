export const APP_NAME = "RelayTrace OS";
export const APP_VERSION = "1.0.0";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// Derive the Swagger docs URL from the API base URL:
// "http://host:port/api/v1" → "http://host:port/api/docs"
export const API_DOCS_URL = (() => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  return base.replace(/\/api\/v\d+$/, "/api/docs").replace(/\/v\d+$/, "/docs");
})();

export const TOKEN_KEY = "rt_access_token";
export const REFRESH_TOKEN_KEY = "rt_refresh_token";
export const USER_KEY = "rt_user";

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    TRIPS: "/admin/trips",
    DRIVERS: "/admin/drivers",
    RECONCILIATION: "/admin/reconciliation",
    ONBOARDING: "/admin/onboarding",
    SETTINGS: "/admin/settings",
  },
  DISPATCHER: {
    DASHBOARD: "/dispatcher/dashboard",
  },
  DRIVER: {
    DASHBOARD: "/driver/dashboard",
    REGISTER_TRIP: "/driver/register-trip",
    HISTORY: "/driver/history",
  },
} as const;

export const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN: ROUTES.ADMIN.DASHBOARD,
  COMPANY_ADMIN: ROUTES.ADMIN.DASHBOARD,
  DISPATCHER: ROUTES.DISPATCHER.DASHBOARD,
  DRIVER: ROUTES.DRIVER.DASHBOARD,
};
