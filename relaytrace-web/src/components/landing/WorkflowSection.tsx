import {
  Truck,
  ScanLine,
  ServerCrash,
  GitMerge,
  BellRing,
  LayoutDashboard,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Truck,
    title: "Driver accepts a load",
    description:
      "The driver takes a trip in Amazon Relay as usual. Nothing changes in their Relay workflow.",
  },
  {
    number: "02",
    icon: ScanLine,
    title: "Register in < 5 seconds",
    description:
      "Driver opens RelayTrace PWA, enters the Trip ID manually or uploads a screenshot. OCR extracts the ID automatically.",
  },
  {
    number: "03",
    icon: ServerCrash,
    title: "System captures the email",
    description:
      "Amazon Relay sends a confirmation email. RelayTrace monitors the inbox and parses the Trip ID independently.",
  },
  {
    number: "04",
    icon: GitMerge,
    title: "Automatic reconciliation",
    description:
      "The system cross-checks: does a driver report exist for this Trip ID from the email? Match = confirmed. No match = alert.",
  },
  {
    number: "05",
    icon: BellRing,
    title: "Real-time alerts",
    description:
      "Unregistered trips, duplicates, or suspicious patterns trigger instant alerts for dispatchers and admins.",
  },
  {
    number: "06",
    icon: LayoutDashboard,
    title: "Full operational visibility",
    description:
      "Admin dashboard shows every trip, every driver, every discrepancy — with complete audit trail and history.",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ color: "#2563eb", background: "#eff6ff" }}
          >
            How it Works
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            From chaos to full traceability
          </h2>
          <p className="text-lg text-slate-500">
            RelayTrace OS plugs into your existing Relay workflow —
            no changes required to how drivers operate.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="relative group">
              {/* Step number */}
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <span
                    className="text-5xl font-black leading-none"
                    style={{
                      background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {number}
                  </span>
                </div>
                <div className="pt-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                    }}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
