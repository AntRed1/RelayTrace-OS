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
      "Cross-checks: does a driver report exist for this Trip ID from the email? Match = confirmed. No match = alert.",
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
    <section
      id="workflow"
      className="relative py-28 overflow-hidden mesh-light"
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.04) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(37,99,235,0.04) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="eyebrow eyebrow-blue mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
            How it Works
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-4 leading-[1.1] tracking-tight">
            From chaos to{" "}
            <span className="gradient-text">full traceability</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            RelayTrace OS plugs into your existing Relay workflow —
            no changes required to how drivers operate.
          </p>
        </div>

        {/* Steps — 3 + 3 two-row grid with connectors */}
        <div className="space-y-5">
          {[STEPS.slice(0, 3), STEPS.slice(3)].map((row, rowIdx) => (
            <div key={rowIdx} className="grid md:grid-cols-3 gap-5">
              {row.map(({ number, icon: Icon, title, description }, colIdx) => {
                const isLast = colIdx === row.length - 1;
                return (
                  <div key={number} className="relative group">
                    {/* Connector line (right side, not on last) */}
                    {!isLast && (
                      <div
                        className="hidden md:block absolute top-9 left-full w-5 z-10"
                        style={{ transform: "translateX(-50%)" }}
                      >
                        <div
                          className="h-px w-full"
                          style={{
                            background:
                              "linear-gradient(90deg,rgba(37,99,235,0.3),rgba(34,211,238,0.3))",
                          }}
                        />
                      </div>
                    )}

                    {/* Card */}
                    <div className="glass-light rounded-2xl p-6 h-full transition-all duration-300">
                      {/* Step number + icon row */}
                      <div className="flex items-center gap-3 mb-5">
                        {/* Step bubble */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                            boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
                          }}
                        >
                          <Icon size={17} className="text-white" />
                        </div>

                        {/* Large step number (decorative) */}
                        <span
                          className="text-4xl font-black leading-none select-none"
                          style={{
                            background: "linear-gradient(135deg,#e2e8f0,#f1f5f9)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {number}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                        {title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
