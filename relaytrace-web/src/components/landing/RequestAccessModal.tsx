"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  CreditCard,
  Mail,
  Phone,
  Users,
  Lock,
} from "lucide-react";
import { billingService } from "@/services/billing.service";
import { PLAN_CONFIG, PlanName } from "@/config/plan.config";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email:       z.string().email("Valid email required"),
  phone:       z.string().optional(),
  driverCount: z
    .number()
    .int()
    .min(1)
    .max(9999)
    .optional(),
});

type Step1Data = z.infer<typeof step1Schema>;

// ─── Plan option card ────────────────────────────────────────────────────────

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PlanName;
  selected: boolean;
  onSelect: () => void;
}) {
  const cfg = PLAN_CONFIG[plan];
  const isFleet = plan === "fleet";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left p-4 rounded-2xl border-2 transition-all"
      style={
        selected
          ? { borderColor: "#2563eb", background: "#eff6ff" }
          : { borderColor: "#e2e8f0", background: "#fff" }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-sm font-bold"
              style={{ color: selected ? "#2563eb" : "#0f172a" }}
            >
              {cfg.displayName}
            </span>
            {plan === "growth" && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-2">
            {cfg.maxDrivers === 0
              ? "Unlimited drivers"
              : `Up to ${cfg.maxDrivers} drivers`}
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className="text-xl font-black"
              style={{ color: selected ? "#2563eb" : "#0f172a" }}
            >
              {cfg.price}
            </span>
            {cfg.period && (
              <span className="text-xs text-slate-400">{cfg.period}</span>
            )}
          </div>
          {isFleet && (
            <p className="text-xs text-slate-400 mt-1">Contact sales for pricing</p>
          )}
        </div>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all"
          style={
            selected
              ? { borderColor: "#2563eb", background: "#2563eb" }
              : { borderColor: "#cbd5e1", background: "#fff" }
          }
        >
          {selected && <Check size={11} strokeWidth={3} color="#fff" />}
        </div>
      </div>
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-select a plan when opened from a pricing card CTA */
  initialPlan?: PlanName;
}

type Step = 1 | 2 | 3;

export function RequestAccessModal({ open, onClose, initialPlan }: Props) {
  const [step, setStep]         = useState<Step>(1);
  const [selectedPlan, setPlan] = useState<PlanName>(initialPlan ?? "growth");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
    resolver:      zodResolver(step1Schema),
    mode:          "onBlur",
  });

  if (!open) return null;

  const handleClose = () => {
    setStep(1);
    setError(null);
    setStep1Data(null);
    setPlan(initialPlan ?? "growth");
    reset();
    onClose();
  };

  // ── Step 1 → 2 ──────────────────────────────────────────────────────────
  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  // ── Step 2 → Stripe ──────────────────────────────────────────────────────
  const onProceedToPayment = async () => {
    if (!step1Data) return;

    if (selectedPlan === "fleet") {
      setStep(3);
      return;
    }

    setSubmitting(true);
    setError(null);

    const origin = window.location.origin;

    try {
      const { url } = await billingService.createCheckout({
        ...step1Data,
        plan:       selectedPlan,
        successUrl: `${origin}/onboarding/success`,
        cancelUrl:  `${origin}/onboarding/cancel`,
      });

      window.location.href = url;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setSubmitting(false);
    }
  };

  // ── Shared field style ────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 " +
    "placeholder:text-slate-400 transition-all";

  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";

  // ── Progress indicators ────────────────────────────────────────────────────
  const STEPS = ["Your Info", "Choose Plan", "Payment"];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}
      >
        {/* Header */}
        <div
          className="px-7 py-5 flex items-center justify-between border-b border-slate-100"
          style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)" }}
        >
          <div>
            <h2 className="text-base font-bold text-white">
              {step === 1 ? "Get Started" : step === 2 ? "Choose Your Plan" : "Contact Sales"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === 1
                ? "Tell us about your operation"
                : step === 2
                ? "Select the plan that fits your fleet"
                : "Fleet plan · custom enterprise pricing"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="px-7 pt-5 pb-0">
          <div className="flex items-center gap-0">
            {STEPS.map((label, idx) => {
              const n = (idx + 1) as Step;
              const done   = step > n;
              const active = step === n;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={
                        done
                          ? { background: "#22c55e", color: "#fff" }
                          : active
                          ? { background: "#2563eb", color: "#fff" }
                          : { background: "#e2e8f0", color: "#94a3b8" }
                      }
                    >
                      {done ? <Check size={12} strokeWidth={3} /> : n}
                    </div>
                    <span
                      className="text-[10px] mt-1 font-medium"
                      style={{ color: active ? "#2563eb" : "#94a3b8" }}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-2 mb-3 rounded transition-all"
                      style={{ background: done ? "#22c55e" : "#e2e8f0" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6">

          {/* ── STEP 1: Company info ─────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    <Building2 size={11} className="inline mr-1 text-slate-400" />
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("companyName")}
                    placeholder="Transportes del Norte LLC"
                    className={inputCls}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>
                    Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("contactName")}
                    placeholder="Juan Pérez"
                    className={inputCls}
                  />
                  {errors.contactName && (
                    <p className="text-xs text-red-500 mt-1">{errors.contactName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  <Mail size={11} className="inline mr-1 text-slate-400" />
                  Business Email <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@company.com"
                  className={inputCls}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    <Phone size={11} className="inline mr-1 text-slate-400" />
                    Phone <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+1 555 123 4567"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    <Users size={11} className="inline mr-1 text-slate-400" />
                    # of Drivers <span className="text-slate-400 font-normal">(approx.)</span>
                  </label>
                  <input
                    {...register("driverCount", {
                      setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10)),
                    })}
                    type="number"
                    min={1}
                    placeholder="12"
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                Next: Choose Plan
                <ArrowRight size={15} />
              </button>

              <p className="text-center text-xs text-slate-400">
                Secure checkout powered by Stripe
              </p>
            </form>
          )}

          {/* ── STEP 2: Plan selection ───────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {(["starter", "growth", "fleet"] as PlanName[]).map((p) => (
                  <PlanCard
                    key={p}
                    plan={p}
                    selected={selectedPlan === p}
                    onSelect={() => setPlan(p)}
                  />
                ))}
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => void onProceedToPayment()}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Redirecting to Stripe…
                    </>
                  ) : selectedPlan === "fleet" ? (
                    <>Contact Sales <ArrowRight size={15} /></>
                  ) : (
                    <>
                      <CreditCard size={15} />
                      Continue to Payment
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <Lock size={10} /> Payments secured by Stripe · Cancel anytime
              </p>
            </div>
          )}

          {/* ── STEP 3: Fleet / contact sales ────────────────────────────── */}
          {step === 3 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}>
                <Building2 size={24} color="#fff" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Let's build your custom plan
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                Fleet pricing is tailored to your specific needs — number of trucks,
                integrations, SLA requirements, and more.
              </p>
              <div
                className="mx-auto max-w-xs p-4 rounded-2xl border border-slate-200 bg-slate-50 text-left space-y-2"
              >
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Your info
                </p>
                {step1Data && (
                  <>
                    <p className="text-sm text-slate-800 font-medium">{step1Data.companyName}</p>
                    <p className="text-xs text-slate-500">{step1Data.email}</p>
                  </>
                )}
              </div>
              <a
                href={`mailto:sales@relaytrace.com?subject=Fleet Plan Inquiry — ${step1Data?.companyName ?? ""}&body=Hi, I'm interested in the Fleet plan for ${step1Data?.companyName ?? "my company"}.%0A%0AContact: ${step1Data?.contactName ?? ""}%0AEmail: ${step1Data?.email ?? ""}%0ADrivers: ${step1Data?.driverCount ?? "?"}%0A%0APlease reach out to discuss pricing.`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                <Mail size={14} /> Contact Sales
              </a>
              <br />
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Back to plans
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
