"use client";

import { Lock, ArrowUpCircle } from "lucide-react";
import { usePlanInfo } from "@/hooks/use-companies";
import { useAuthStore } from "@/stores/auth.store";
import {
  PlanFeature,
  PlanName,
  FEATURE_LABELS,
  FEATURE_MIN_PLAN,
  PLAN_CONFIG,
  planHasFeature,
} from "@/config/plan.config";

// ─── Upgrade prompt ───────────────────────────────────────────────────────────

interface UpgradePromptProps {
  feature: PlanFeature;
  currentPlan: PlanName;
}

function UpgradePrompt({ feature, currentPlan }: UpgradePromptProps) {
  const requiredPlan = FEATURE_MIN_PLAN[feature];
  const required     = PLAN_CONFIG[requiredPlan];
  const current      = PLAN_CONFIG[currentPlan];

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border text-center space-y-4"
      style={{ background: "#f8fafc", borderColor: "#e2e8f0", borderStyle: "dashed" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)" }}
      >
        <Lock size={22} className="text-slate-400" />
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {FEATURE_LABELS[feature]}
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          This feature is available from the{" "}
          <span className="font-semibold" style={{ color: required.color }}>
            {required.displayName}
          </span>{" "}
          plan. Your current plan is{" "}
          <span className="font-semibold" style={{ color: current.color }}>
            {current.displayName}
          </span>
          .
        </p>
      </div>

      <div
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: `linear-gradient(135deg,${required.color},${required.color}cc)` }}
      >
        <ArrowUpCircle size={15} />
        Upgrade to {required.displayName} — {required.price}
        {required.period && ` ${required.period}`}
      </div>

      <p className="text-xs text-slate-400">
        Contact your administrator or RelayTrace OS support to change your plan.
      </p>
    </div>
  );
}

// ─── PlanGate ─────────────────────────────────────────────────────────────────

interface PlanGateProps {
  /** Feature required to render children. */
  feature: PlanFeature;
  /** Custom fallback; defaults to UpgradePrompt. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders children only if the authenticated company's plan includes `feature`.
 * SUPER_ADMIN always bypasses (no plan restriction).
 *
 * Shows a loading skeleton while plan info is being fetched, and an UpgradePrompt
 * (or custom fallback) when the feature is not available.
 */
export function PlanGate({ feature, fallback, children }: PlanGateProps) {
  const user         = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // SUPER_ADMIN bypasses all plan restrictions
  if (isSuperAdmin) return <>{children}</>;

  return (
    <PlanGateInner feature={feature} fallback={fallback}>
      {children}
    </PlanGateInner>
  );
}

// Split inner so hook runs after SUPER_ADMIN bypass (hooks can't be conditional)
function PlanGateInner({ feature, fallback, children }: PlanGateProps) {
  const { data: planInfo, isLoading } = usePlanInfo(true);

  if (isLoading) {
    return (
      <div className="py-10 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const plan         = (planInfo?.plan as PlanName) ?? "starter";
  const hasAccess    = planHasFeature(plan, feature);

  if (!hasAccess) {
    return (
      <>
        {fallback ?? (
          <UpgradePrompt feature={feature} currentPlan={plan} />
        )}
      </>
    );
  }

  return <>{children}</>;
}
