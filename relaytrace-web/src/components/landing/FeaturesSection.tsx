import {
  ScanLine,
  ShieldCheck,
  Users,
  Mail,
  BarChart3,
  Smartphone,
} from "lucide-react";

const FEATURES = [
  {
    icon: Smartphone,
    color: "#2563eb",
    bg: "#eff6ff",
    title: "PWA — No App Store needed",
    description:
      "Drivers install directly from the browser on any Android or iPhone. Updates are instant. No Play Store friction.",
  },
  {
    icon: ScanLine,
    color: "#0891b2",
    bg: "#ecfeff",
    title: "OCR — Auto Trip ID extraction",
    description:
      "Driver uploads the Relay confirmation screenshot. Azure AI Document Intelligence extracts the Trip ID automatically.",
  },
  {
    icon: Mail,
    color: "#7c3aed",
    bg: "#f5f3ff",
    title: "Relay Email Monitoring",
    description:
      "The system monitors the Relay inbox via Microsoft Graph API and builds an independent source of truth for every trip.",
  },
  {
    icon: ShieldCheck,
    color: "#059669",
    bg: "#f0fdf4",
    title: "Anti-fraud Reconciliation",
    description:
      "Every Relay email is cross-checked against driver reports. Unregistered trips generate instant alerts.",
  },
  {
    icon: Users,
    color: "#d97706",
    bg: "#fffbeb",
    title: "Multi-tenant · RBAC",
    description:
      "Each company is fully isolated. SUPER_ADMIN, COMPANY_ADMIN, DISPATCHER, and DRIVER roles with granular permissions.",
  },
  {
    icon: BarChart3,
    color: "#dc2626",
    bg: "#fef2f2",
    title: "Operational Dashboard",
    description:
      "Real-time KPIs: trips today, active drivers, pending alerts, reconciliation rate — all in one place.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24"
      style={{ background: "#f8fafc" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ color: "#059669", background: "#f0fdf4" }}
          >
            Platform Features
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Everything your fleet needs
          </h2>
          <p className="text-lg text-slate-500">
            From the moment a driver taps "Accept" in Relay,
            to the admin audit trail — fully covered.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, bg, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-7 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: bg }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
