import {
  GradientDef,
  DashboardIcon,
  TripsIcon,
  PeopleIcon,
  OCRProcessingIcon,
  ReconciliationIcon,
} from "@/components/ui/relay-icons";

const FEATURES = [
  {
    Icon: DashboardIcon,
    title: "Dashboard",
    description:
      "Real-time KPIs: trips today, active drivers, pending alerts, reconciliation rate — all in one place.",
    featured: true,
  },
  {
    Icon: TripsIcon,
    title: "Trips Management",
    description:
      "Driver uploads the Relay screenshot. Azure AI Document Intelligence extracts the Trip ID automatically.",
  },
  {
    Icon: PeopleIcon,
    title: "People Management",
    description:
      "Monitors the Relay inbox via Microsoft Graph API and builds an independent source of truth for every trip.",
  },
  {
    Icon: OCRProcessingIcon,
    title: "OCR Processing",
    description:
      "Every Relay email is cross-checked against driver reports. Unregistered trips generate instant alerts.",
  },
  {
    Icon: ReconciliationIcon,
    title: "Reconciliation",
    description:
      "Fully isolated companies. SUPER_ADMIN, COMPANY_ADMIN, DISPATCHER, and DRIVER roles with granular permissions.",
  },
  {
    Icon: DashboardIcon,
    title: "Full Operational Visibility",
    description:
      "Admin dashboard shows every trip, every driver, every discrepancy — with complete audit trail and history.",
  },
];

const [featured, ...rest] = FEATURES;

export function FeaturesSection() {
  const FeaturedIcon = featured.Icon;

  return (
    <section id="features" className="relative py-28 overflow-hidden" style={{ background: "#fff" }}>
      {/* Subtle mesh bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%,rgba(34,211,238,0.06) 0,transparent 55%)," +
            "radial-gradient(ellipse at 10% 80%,rgba(37,99,235,0.05) 0,transparent 50%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow eyebrow-emerald mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Platform Features
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-4 leading-[1.1] tracking-tight">
            Everything your{" "}
            <span className="gradient-text">fleet needs</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            From the moment a driver taps "Accept" in Relay,
            to the admin audit trail — fully covered.
          </p>
        </div>

        {/* Asymmetric layout: featured left + 2×2 right + full-width row */}
        <div className="space-y-5">
          {/* Top row */}
          <div className="grid lg:grid-cols-[1.5fr_1fr_1fr] gap-5">
            {/* Large featured card */}
            <div
              className="gradient-border-card p-8 flex flex-col justify-between min-h-[260px] group transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div>
                <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
                  <FeaturedIcon size={56} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-3 inline-block"
                  style={{ color: "#2563eb", background: "rgba(37,99,235,0.08)" }}
                >
                  Core Feature
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                  {featured.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {featured.description}
                </p>
              </div>

              {/* Decorative gradient bar */}
              <div
                className="h-1 rounded-full mt-6 opacity-40 group-hover:opacity-70 transition-opacity"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              />
            </div>

            {/* Right: 2 small cards stacked */}
            {rest.slice(0, 2).map(({ Icon, title, description }) => (
              <div
                key={title}
                className="gradient-border-card p-6 group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={40} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* Bottom row — 3 equal cards */}
          <div className="grid sm:grid-cols-3 gap-5">
            {rest.slice(2).map(({ Icon, title, description }) => (
              <div
                key={title}
                className="gradient-border-card p-6 group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={40} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
