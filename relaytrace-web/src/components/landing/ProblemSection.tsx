import { MessageCircleWarning, FileX2, UserX, Clock } from "lucide-react";

const PROBLEMS = [
  {
    icon: MessageCircleWarning,
    color: "#f97316",
    bg: "#fff7ed",
    title: "Screenshots on WhatsApp",
    description:
      "Drivers send confirmation photos to group chats. Screenshots get lost, are out of order, and impossible to audit.",
  },
  {
    icon: FileX2,
    color: "#ef4444",
    bg: "#fef2f2",
    title: "Manual spreadsheets",
    description:
      "Someone manually transcribes trip IDs to a spreadsheet — error-prone, time-consuming, and always out of date.",
  },
  {
    icon: UserX,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    title: "No driver-to-trip link",
    description:
      "Multiple drivers share one Relay account. Nobody can tell definitively who took which trip, when, or for how long.",
  },
  {
    icon: Clock,
    color: "#dc2626",
    bg: "#fef2f2",
    title: "Fraud goes undetected",
    description:
      "Trips that appear in Relay emails but were never reported by any driver pass through completely unnoticed.",
  },
];

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="py-24"
      style={{ background: "#f8fafc" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ color: "#ef4444", background: "#fef2f2" }}
          >
            The Problem
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            The chaos most fleets live with
          </h2>
          <p className="text-lg text-slate-500">
            Without a structured system, trip tracking at shared-account Relay
            operations turns into an operational nightmare.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROBLEMS.map(({ icon: Icon, color, bg, title, description }) => (
            <div
              key={title}
              className="rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
              style={{ background: "#ffffff" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: bg }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-14 text-center">
          <blockquote className="text-xl font-semibold text-slate-700 max-w-2xl mx-auto">
            "If it's not in RelayTrace, it didn't happen."
          </blockquote>
          <p className="text-sm text-slate-400 mt-2">
            — The operational standard RelayTrace OS enables
          </p>
        </div>
      </div>
    </section>
  );
}
