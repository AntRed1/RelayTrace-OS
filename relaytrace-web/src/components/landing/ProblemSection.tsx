import {
  WhatsAppScreenshotIcon,
  ManualSpreadsheetsIcon,
  NoDriverLinkIcon,
  FraudUndetectedIcon,
} from "@/components/ui/landing-icons";

const PROBLEMS = [
  {
    Icon: WhatsAppScreenshotIcon,
    title: "Screenshots on WhatsApp",
    description:
      "Drivers send confirmation photos to group chats. Screenshots get lost, are out of order, and impossible to audit.",
  },
  {
    Icon: ManualSpreadsheetsIcon,
    title: "Manual spreadsheets",
    description:
      "Someone manually transcribes trip IDs to a spreadsheet — error-prone, time-consuming, and always out of date.",
  },
  {
    Icon: NoDriverLinkIcon,
    title: "No driver-to-trip link",
    description:
      "Multiple drivers share one Relay account. Nobody can tell definitively who took which trip, when, or for how long.",
  },
  {
    Icon: FraudUndetectedIcon,
    title: "Fraud goes undetected",
    description:
      "Trips that appear in Relay emails but were never reported by any driver pass through completely unnoticed.",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="relative py-28 overflow-hidden mesh-dark">
      {/* Ambient orbs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle,#ef4444,transparent)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[80px] opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle,#8b5cf6,transparent)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow eyebrow-red mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
            The Problem
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4 leading-[1.1] tracking-tight">
            The chaos most{" "}
            <span className="gradient-text-warm">fleets live with</span>
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#94a3b8" }}>
            Without a structured system, trip tracking at shared-account Relay
            operations turns into an operational nightmare.
          </p>
        </div>

        {/* Cards — 2+2 asymmetric glass grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROBLEMS.map(({ Icon, title, description }, i) => (
            <div
              key={title}
              className="glass-dark rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1"
              style={{
                transitionDelay: `${i * 50}ms`,
              }}
            >
              {/* Icon */}
              <div className="mb-5 transition-transform duration-300 group-hover:scale-110">
                <Icon size={44} />
              </div>

              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* Blockquote */}
        <div className="mt-16 relative">
          <div className="gradient-divider mb-10" />
          <div className="text-center">
            <blockquote className="text-xl md:text-2xl font-semibold max-w-2xl mx-auto leading-relaxed" style={{ color: "#cbd5e1" }}>
              "If it's not in RelayTrace,{" "}
              <span className="gradient-text">it didn't happen.</span>"
            </blockquote>
            <p className="text-sm mt-3" style={{ color: "#475569" }}>
              — The operational standard RelayTrace OS enables
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
