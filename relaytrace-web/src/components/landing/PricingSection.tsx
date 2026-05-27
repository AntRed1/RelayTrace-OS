import { Check } from "lucide-react";
import { PlanName } from "@/config/plan.config";

interface Plan {
  name: string;
  planKey: PlanName;
  price: string;
  period: string;
  description: string;
  drivers: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    planKey: "starter",
    price: "$49",
    period: "/ month",
    description: "Perfect for small carriers just getting started.",
    drivers: "Up to 5 drivers",
    features: [
      "Manual trip registration",
      "Driver mobile PWA",
      "Admin dashboard",
      "Basic audit trail",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Growth",
    planKey: "growth",
    price: "$149",
    period: "/ month",
    description: "For growing operations that need automation.",
    drivers: "Up to 20 drivers",
    features: [
      "Everything in Starter",
      "OCR screenshot → Trip ID",
      "Email reconciliation engine",
      "Anti-fraud alerts",
      "Dispatcher role",
      "Priority support",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Fleet",
    planKey: "fleet",
    price: "Custom",
    period: "",
    description: "For large fleets with enterprise requirements.",
    drivers: "100+ drivers",
    features: [
      "Everything in Growth",
      "Custom integrations",
      "Multi-account Relay support",
      "SLA guarantee",
      "Dedicated onboarding",
      "White-label option",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

interface Props {
  onSelectPlan: (plan: PlanName) => void;
}

export function PricingSection({ onSelectPlan }: Props) {
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
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-8 border transition-all"
              style={
                plan.highlight
                  ? {
                      background: "linear-gradient(160deg,#0f172a,#1e293b)",
                      borderColor: "rgba(34,211,238,0.3)",
                      boxShadow: "0 20px 60px rgba(37,99,235,0.25)",
                      transform: "scale(1.03)",
                    }
                  : {
                      background: "#ffffff",
                      borderColor: "#e2e8f0",
                    }
              }
            >
              {/* Badge */}
              {plan.highlight && (
                <div
                  className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                  style={{
                    background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                    color: "#fff",
                  }}
                >
                  Most Popular
                </div>
              )}

              <h3
                className="text-xl font-bold mb-1"
                style={{ color: plan.highlight ? "#f8fafc" : "#0f172a" }}
              >
                {plan.name}
              </h3>
              <p
                className="text-sm mb-5"
                style={{ color: plan.highlight ? "#94a3b8" : "#64748b" }}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className="text-4xl font-black"
                  style={{ color: plan.highlight ? "#f8fafc" : "#0f172a" }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className="text-sm"
                    style={{ color: plan.highlight ? "#64748b" : "#94a3b8" }}
                  >
                    {plan.period}
                  </span>
                )}
              </div>
              <p
                className="text-xs font-medium mb-7"
                style={{ color: plan.highlight ? "#22d3ee" : "#2563eb" }}
              >
                {plan.drivers}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: plan.highlight ? "rgba(34,211,238,0.15)" : "#f0fdf4",
                      }}
                    >
                      <Check
                        size={10}
                        style={{ color: plan.highlight ? "#22d3ee" : "#16a34a" }}
                        strokeWidth={3}
                      />
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: plan.highlight ? "#cbd5e1" : "#475569" }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => onSelectPlan(plan.planKey)}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={
                  plan.highlight
                    ? {
                        background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                        color: "#fff",
                      }
                    : {
                        background: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #e2e8f0",
                      }
                }
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          All plans include a 14-day free trial · Secure payments via Stripe
        </p>
      </div>
    </section>
  );
}
