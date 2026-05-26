import { ArrowRight } from "lucide-react";

const STATS = [
  { value: "< 5s", label: "Trip registration" },
  { value: "100%", label: "Trip coverage" },
  { value: "0", label: "WhatsApp dependencies" },
  { value: "24/7", label: "Fraud monitoring" },
];

interface Props {
  onRequestAccess: () => void;
}

export function CtaSection({ onRequestAccess }: Props) {
  return (
    <>
      {/* Stats strip */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p
                  className="text-4xl font-black mb-1"
                  style={{
                    background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {value}
                </p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0f172a,#1e293b)" }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.07) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle,#22d3ee,transparent)" }}
        />

        <div className="relative max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Ready to eliminate<br />the chaos?
          </h2>
          <p className="text-lg" style={{ color: "#94a3b8" }}>
            Join carriers already running operations with full traceability.
            Setup takes less than 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={onRequestAccess}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                boxShadow: "0 0 30px rgba(37,99,235,0.4)",
              }}
            >
              Request Access — Free Trial
              <ArrowRight size={15} />
            </button>
          </div>
          <p className="text-xs" style={{ color: "#475569" }}>
            No credit card · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}
