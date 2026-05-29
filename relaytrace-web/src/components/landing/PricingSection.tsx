"use client";

import { Check } from "lucide-react";
import { PublicPlan } from "@/types";

interface Props {
  plans: PublicPlan[];
  onSelectPlan: (slug: string) => void;
}

function formatPrice(plan: PublicPlan): { amount: string; period: string } {
  if (plan.priceMonthly === 0) return { amount: "Custom", period: "" };
  return {
    amount: `$${plan.priceMonthly % 1 === 0 ? plan.priceMonthly : plan.priceMonthly.toFixed(2)}`,
    period: "/ month",
  };
}

function PlanCard({
  plan,
  onSelect,
}: {
  plan: PublicPlan;
  onSelect: () => void;
}) {
  const { amount, period } = formatPrice(plan);
  const h = plan.isPopular;

  return (
    <div
      className="rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1"
      style={
        h
          ? {
              background:  "linear-gradient(160deg,#0f172a,#1e293b)",
              borderColor: "rgba(34,211,238,0.3)",
              boxShadow:   "0 20px 60px rgba(37,99,235,0.25)",
              transform:   "scale(1.03) translateY(0)",
            }
          : { background: "#ffffff", borderColor: "#e2e8f0" }
      }
    >
      {/* Most popular badge */}
      {h && (
        <div
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
          style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)", color: "#fff" }}
        >
          Most Popular
        </div>
      )}

      <h3 className="text-xl font-bold mb-1" style={{ color: h ? "#f8fafc" : "#0f172a" }}>
        {plan.displayName}
      </h3>
      <p className="text-sm mb-5" style={{ color: h ? "#94a3b8" : "#64748b" }}>
        {plan.description}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-4xl font-black" style={{ color: h ? "#f8fafc" : "#0f172a" }}>
          {amount}
        </span>
        {period && (
          <span className="text-sm" style={{ color: h ? "#64748b" : "#94a3b8" }}>
            {period}
          </span>
        )}
      </div>
      <p className="text-xs font-medium mb-7" style={{ color: h ? "#22d3ee" : "#2563eb" }}>
        {plan.maxDrivers === null ? "Unlimited drivers" : `Up to ${plan.maxDrivers} drivers`}
      </p>

      {/* Feature bullets */}
      <ul className="space-y-3 mb-8">
        {plan.featureLabels.map((label) => (
          <li key={label} className="flex items-start gap-2.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: h ? "rgba(34,211,238,0.15)" : "#f0fdf4" }}
            >
              <Check size={10} style={{ color: h ? "#22d3ee" : "#16a34a" }} strokeWidth={3} />
            </div>
            <span className="text-sm" style={{ color: h ? "#cbd5e1" : "#475569" }}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {h ? (
        <button
          onClick={onSelect}
          className="group relative w-full py-3 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(37,99,235,0.55)] active:scale-[0.98]"
          style={{
            background:  "linear-gradient(135deg,#22d3ee,#2563eb)",
            boxShadow:   "0 0 20px rgba(37,99,235,0.35)",
          }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background:     "linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%)",
              backgroundSize: "200% 100%",
              animation:      "plan-shimmer 1.5s infinite",
            }}
          />
          <span className="relative">{plan.ctaLabel}</span>
        </button>
      ) : (
        <button
          onClick={onSelect}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 hover:border-slate-300 active:scale-[0.98]"
          style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" }}
        >
          {plan.ctaLabel}
        </button>
      )}
    </div>
  );
}

export function PricingSection({ plans, onSelectPlan }: Props) {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ color: "#7c3aed", background: "#f5f3ff" }}
          >
            Pricing
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-500">
            Pay per active driver. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        {plans.length === 0 ? (
          /* Graceful empty state while plans load or API is unreachable */
          <p className="text-center text-slate-400 py-16">
            Pricing information is being updated. Please check back shortly.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {plans.map((plan) => (
              <PlanCard
                key={plan.slug}
                plan={plan}
                onSelect={() => onSelectPlan(plan.slug)}
              />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-10">
          All plans include a 14-day free trial · Secure payments via Stripe
        </p>
      </div>

      <style>{`
        @keyframes plan-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </section>
  );
}
