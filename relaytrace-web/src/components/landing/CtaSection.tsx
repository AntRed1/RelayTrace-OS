import { ArrowRight, Clock, Shield, TrendingUp, Zap } from "lucide-react";

const STATS = [
  { value: "< 5s",  label: "Trip registration",   icon: Zap      },
  { value: "100%",  label: "Trip coverage",        icon: Shield   },
  { value: "0",     label: "WhatsApp dependencies",icon: TrendingUp},
  { value: "24/7",  label: "Fraud monitoring",     icon: Clock    },
];

interface Props {
  onRequestAccess: () => void;
}

export function CtaSection({ onRequestAccess }: Props) {
  return (
    <>
      {/* ── Stats strip ───────────────────────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden" style={{ background: "#f8fafc" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.03) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(37,99,235,0.03) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="gradient-border-card p-5 text-center group transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg,rgba(34,211,238,0.15),rgba(37,99,235,0.15))",
                  }}
                >
                  <Icon size={16} className="text-blue-500" />
                </div>
                <p
                  className="text-3xl font-black mb-1 gradient-text"
                >
                  {value}
                </p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden mesh-dark">
        {/* Ambient orbs */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#22d3ee,transparent)" }}
        />
        <div
          className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#818cf8,#2563eb)" }}
        />

        {/* Rotating gradient ring (decorative) */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 pointer-events-none animate-spin-slow"
          style={{
            background: "conic-gradient(from 0deg,#22d3ee,#2563eb,#818cf8,transparent,#22d3ee)",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-8"
            style={{
              color: "#22d3ee",
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.2)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Ready when you are
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
            Ready to eliminate
            <br />
            <span className="gradient-text">the chaos?</span>
          </h2>
          <p className="text-lg leading-relaxed mb-10" style={{ color: "#64748b" }}>
            Join carriers already running operations with full traceability.
            Setup takes less than 24 hours.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={onRequestAccess} className="btn-primary text-sm px-7 py-3.5">
              Get Started Free — No credit card
              <ArrowRight size={15} />
            </button>
          </div>

          <p className="text-xs mt-6" style={{ color: "#334155" }}>
            14-day free trial · Cancel anytime · Secure payments via Stripe
          </p>
        </div>
      </section>
    </>
  );
}
