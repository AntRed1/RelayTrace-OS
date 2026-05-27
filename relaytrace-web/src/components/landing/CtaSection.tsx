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
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle,#818cf8,#2563eb)" }}
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
            {/* Primary CTA — shimmer + glow + scale */}
            <button
              onClick={onRequestAccess}
              className="group relative flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                boxShadow: "0 0 28px rgba(37,99,235,0.4)",
              }}
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
              Get Started Free — No credit card
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </div>
          <p className="text-xs" style={{ color: "#475569" }}>
            14-day free trial · Cancel anytime · Secure payments via Stripe
          </p>
        </div>

        {/* Shimmer keyframe */}
        <style>{`
          @keyframes shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }
        `}</style>
      </section>
    </>
  );
}
