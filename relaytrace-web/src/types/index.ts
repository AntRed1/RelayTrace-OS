// ============================================================
// Auth
// ============================================================
export type UserRole =
  | "SUPER_ADMIN"
  | "COMPANY_ADMIN"
  | "DISPATCHER"
  | "DRIVER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginResponse extends User, AuthTokens {}

// ============================================================
// Company
// ============================================================
export interface Company {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  plan: string;         // 'starter' | 'growth' | 'fleet'
  createdAt: string;
  updatedAt: string;
}

export interface PlanInfo {
  plan: string;
  displayName: string;
  price: string;
  period: string;
  maxDrivers: number | null;          // null = unlimited (fleet)
  currentDrivers: number;
  driverSlotsRemaining: number | null; // null = unlimited
  features: string[];
}

export type CompanyRequestStatus = "pending" | "approved" | "rejected";

export interface CompanyRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  driverCount?: number | null;
  notes?: string | null;
  status: CompanyRequestStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Trip
// ============================================================
export type TripStatus = "pending" | "confirmed" | "flagged";
export type TripSourceType = "manual" | "ocr" | "relay_email";
export type OcrStatus = "none" | "pending" | "processing" | "completed" | "failed";

export interface CompanySummary {
  id: string;
  name: string;
}

export interface Trip {
  id: string;
  companyId: string;
  driverId: string;
  driver: DriverSummary;
  company?: CompanySummary;
  tripId: string;
  status: TripStatus;
  sourceType: TripSourceType;
  ocrStatus: OcrStatus;
  screenshotUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
  alerts?: Alert[];
}

export interface CreateTripPayload {
  tripId: string;
  screenshotUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface DashboardAlert {
  id: string;
  companyId: string;
  tripId: string;
  trip: { id: string; tripId: string };
  alertType: AlertType;
  resolved: boolean;
  createdAt: string;
}

export interface MapPoint {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  registeredAt: string;
  driver: { name: string };
}

// ============================================================
// Driver
// ============================================================
export interface DriverSummary {
  id: string;
  name: string;
  email: string;
  status: string;
  role: { id: string; name: string };
}

export interface Driver extends DriverSummary {
  companyId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverStats {
  driver: Driver;
  tripStats: { status: TripStatus; _count: number }[];
  totalTrips: number;
}

// ============================================================
// Alert
// ============================================================
export type AlertType =
  | "missing_trip"
  | "duplicate_trip"
  | "suspicious_activity";

export interface Alert {
  id: string;
  companyId: string;
  tripId: string;
  alertType: AlertType;
  resolved: boolean;
  createdAt: string;
}

// ============================================================
// Dashboard
// ============================================================
export interface DashboardSummary {
  tripsToday: number;
  activeDrivers: number;
  totalTrips: number;
  pendingAlerts: number;
}

export interface DashboardActivity {
  recentTrips: Trip[];
}

// ============================================================
// Reconciliation
// ============================================================
export interface RelayEmailLog {
  id: string;
  relayTripId: string;
  subject?: string;
  receivedAt?: string;
}

export interface Reconciliation {
  id: string;
  companyId: string;
  tripId: string | null;
  relayEmailLogId: string;
  relayEmailLog?: RelayEmailLog | null;
  matched: boolean;
  discrepancyReason: string | null;
  checkedAt: string;
  trip?: Trip | null;
}

export interface ReconciliationSummary {
  total: number;
  matched: number;
  unmatched: number;
  matchRate: number;
}

// ============================================================
// Plans
// ============================================================

/** Full plan shape (admin endpoints — includes Stripe IDs). */
export interface Plan {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  currency: string;
  maxDrivers: number | null;
  featureLabels: string[];
  featureFlags: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  ctaLabel: string;
  stripePriceId: string | null;
  stripeProductId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Minimal plan shape returned by the public GET /plans endpoint. */
export interface PublicPlan {
  slug: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  currency: string;
  maxDrivers: number | null;
  featureLabels: string[];
  isPopular: boolean;
  ctaLabel: string;
}

export interface CreatePlanPayload {
  slug: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  currency?: string;
  maxDrivers?: number | null;
  featureLabels: string[];
  featureFlags: string[];
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  ctaLabel?: string;
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

// ============================================================
// Audit
// ============================================================
export interface AuditLogEntry {
  id:          string;
  action:      string;
  companyId:   string;
  companyName: string | null;
  userId:      string | null;
  userName:    string | null;
  userEmail:   string | null;
  metadata:    Record<string, unknown>;
  ipAddress:   string | null;
  userAgent:   string | null;
  createdAt:   string;
}

// ============================================================
// API
// ============================================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
