import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { ROUTES } from "@/config/constants";

interface Props {
  onRequestAccess: () => void;
}

const TRUST_ITEMS = [
  { icon: Zap,          text: "< 5 sec per trip"     },
  { icon: ShieldCheck,  text: "Anti-fraud built-in"  },
  { icon: BarChart3,    text: "Real-time dashboard"  },
];

export function HeroSection({ onRequestAccess }: Props) {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(160deg,#0f172a 0%,#1e293b 100%)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.07) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blobs */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#22d3ee,#2563eb)" }}
      />
      <div
        className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#818cf8,#2563eb)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* ── Copy ──────────────────────────────────────────────────────────── */}
        <div className="space-y-8">
          {/* Eyebrow pill */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold"
            style={{
              borderColor: "rgba(34,211,238,0.3)",
              color: "#22d3ee",
              background: "rgba(34,211,238,0.08)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Built for Amazon Relay carriers
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            <span className="text-white">Operational</span>{" "}
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg,#22d3ee 0%,#60a5fa 60%,#818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Traceability
            </span>
            <br />
            <span className="text-white">for Amazon Relay</span>
          </h1>

          {/* Sub-text */}
          <p className="text-lg leading-relaxed max-w-xl" style={{ color: "#94a3b8" }}>
            Replace WhatsApp screenshots and manual spreadsheets with{" "}
            <span className="text-slate-300">structured trip traceability</span>,
            automated reconciliation, and real-time fraud detection.
            All in a PWA faster than sending a message.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-3">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }}
              >
                <Icon size={13} className="text-cyan-400" />
                {text}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Primary CTA — vibrant with glow + scale */}
            <button
              onClick={onRequestAccess}
              className="group relative flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                boxShadow: "0 0 24px rgba(37,99,235,0.4)",
              }}
            >
              {/* Shimmer overlay */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.15) 50%,transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
              Get Started Free
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>

            {/* Secondary CTA */}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.97]"
              style={{
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              Sign In →
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-xs" style={{ color: "#475569" }}>
            🔒 Secure · No credit card required for trial · Cancel anytime
          </p>
        </div>

        {/* ── App mockup ────────────────────────────────────────────────────── */}
        <div className="hidden lg:flex justify-center items-center">
          <div
            className="relative rounded-3xl overflow-hidden transition-transform duration-700 hover:scale-[1.02]"
            style={{
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <Image
              src="/images/app-mockup.png"
              alt="RelayTrace OS app in use"
              width={520}
              height={380}
              className="w-full h-auto object-cover"
              priority
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg,transparent 60%,rgba(15,23,42,0.6) 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(transparent,#f8fafc)" }}
      />

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </section>
  );
}
