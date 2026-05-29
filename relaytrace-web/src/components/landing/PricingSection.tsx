"use client";

import { Check, Sparkles } from "lucide-react";
import { PublicPlan } from "@/types";

interface Props {
  plans: PublicPlan[];
  onSelectPlan: (slug: string) => void;
}

function formatPrice(plan: PublicPlan) {
  if (plan.priceMonthly === 0) return { amount: "Custom", period: "" };
  return {
    amount: `$${plan.priceMonthly % 1 === 0 ? plan.priceMonthly : plan.priceMonthly.toFixed(2)}`,
    period: "/mo",
  };
}

function PlanCard({ plan, onSelect }: { plan: PublicPlan; onSelect: () => void }) {
  const { amount, period } = formatPrice(plan);
  const popular = plan.isPopular;

  if (popular) {
    return (
      <div
        className="relative rounded-2xl p-8 flex flex-col"
        style={{
          background: "linear-gradient(160deg,#0f172a 0%,#1a2744 100%)",
          border: "1px solid rgba(34,211,238,0.25)",
          boxShadow:
            "0 0 0 1px rgba(34,211,238,0.1) inset, 0 24px 64px rgba(37,99,235,0.3)",
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle,#22d3ee,transparent)" }}
        />

        {/* Popular badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <div
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
          >
            <Sparkles size={11} />
            Most Popular
          </div>
        </div>

        {/* Name */}
        <div className="mb-6 pt-2">
          <h3 className="text-xl font-bold text-white mb-1">{plan.displayName}</h3>
          <p className="text-sm" style={{ color: "#64748b" }}>{plan.description}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-5xl font-black text-white">{amount}</span>
          {period && <span className="text-sm font-medium" style={{ color: "#475569" }}>{period}</span>}
        </div>
        <p className="text-xs font-semibold mb-7" style={{ color: "#22d3ee" }}>
          {plan.maxDrivers === null ? "Unlimited drivers" : `Up to ${plan.maxDrivers} drivers`}
        </p>

        {/* Divider */}
        <div
          className="h-px mb-6 opacity-20"
          style={{ background: "linear-gradient(90deg,transparent,#22d3ee,transparent)" }}
        />

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {plan.featureLabels.map((label) => (
            <li key={label} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(34,211,238,0.15)" }}
              >
                <Check size={11} style={{ color: "#22d3ee" }} strokeWidth={3} />
              </div>
              <span className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button onClick={onSelect} className="btn-primary w-full justify-center text-sm">
          {plan.ctaLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="gradient-border-card p-8 flex flex-col transition-all duration-300 hover:-translate-y-1">
      {/* Name */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.displayName}</h3>
        <p className="text-sm text-slate-500">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-5xl font-black text-slate-900">{amount}</span>
        {period && <span className="text-sm font-medium text-slate-400">{period}</span>}
      </div>
      <p className="text-xs font-semibold text-blue-600 mb-7">
        {plan.maxDrivers === null ? "Unlimited drivers" : `Up to ${plan.maxDrivers} drivers`}
      </p>

      {/* Divider */}
      <div className="gradient-divider mb-6" />

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.featureLabels.map((label) => (
          <li key={label} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50">
              <Check size={11} className="text-emerald-500" strokeWidth={3} />
            </div>
            <span className="text-sm text-slate-600 leading-relaxed">{label}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button onClick={onSelect} className="btn-secondary w-full justify-center text-sm">
        {plan.ctaLabel}
      </button>
    </div>
  );
}

export function PricingSection({ plans, onSelectPlan }: Props) {
  return (
    <section id="pricing" className="relative py-28 overflow-hidden" style={{ background: "#fff" }}>
      {/* Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%,rgba(37,99,235,0.06) 0,transparent 60%)," +
            "radial-gradient(ellipse at 50% 100%,rgba(34,211,238,0.04) 0,transparent 60%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="eyebrow eyebrow-purple mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-4 leading-[1.1] tracking-tight">
            Simple,{" "}
            <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Pay per active driver. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        {plans.length === 0 ? (
          <p className="text-center text-slate-400 py-16">
            Pricing information is being updated. Please check back shortly.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 items-center">
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
    </section>
  );
}
