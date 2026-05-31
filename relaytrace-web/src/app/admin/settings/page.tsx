"use client";

import { useState }                              from "react";
import { TopBar }                                from "@/components/layouts/TopBar";
import { PlanBadge }                             from "@/components/plan/PlanBadge";
import { ChangePasswordModal }                   from "@/components/people/ChangePasswordModal";
import { useAuthStore }                          from "@/stores/auth.store";
import {
  usePlanInfo,
  useAllCompanies,
  useUpdatePlan as useUpdateCompanyPlan,
} from "@/hooks/use-companies";
import { usePlans }                              from "@/hooks/use-plans";
import { useChangePassword }                     from "@/hooks/use-users";
import { FEATURE_LABELS, FEATURE_MIN_PLAN, PLAN_CONFIG, PlanName } from "@/config/plan.config";
import {
  Building2,
  Shield,
  CreditCard,
  Users,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title:    string;
  icon?:    React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: "var(--rt-shadow-sm)" }}
    >
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        {Icon && <Icon size={15} className="text-slate-400" />}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
        {label}
      </label>
      <div className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200">
        {value}
      </div>
    </div>
  );
}

// ─── Driver usage bar ─────────────────────────────────────────────────────────

function DriverUsageBar({ current, max }: { current: number; max: number | null }) {
  if (max === null) {
    return (
      <p className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{current}</span> active drivers ·{" "}
        <span className="text-emerald-600 font-medium">unlimited</span>
      </p>
    );
  }

  const pct    = Math.min((current / max) * 100, 100);
  const isNear = pct >= 80;
  const isFull = current >= max;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          <span
            className="font-semibold"
            style={{ color: isFull ? "#dc2626" : isNear ? "#f97316" : "#0f172a" }}
          >
            {current}
          </span>{" "}
          / {max} active drivers
        </span>
        <span
          className="font-semibold"
          style={{ color: isFull ? "#dc2626" : isNear ? "#f97316" : "#64748b" }}
        >
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width:      `${pct}%`,
            background: isFull
              ? "#dc2626"
              : isNear
              ? "linear-gradient(90deg,#f97316,#ef4444)"
              : "linear-gradient(90deg,#22d3ee,#2563eb)",
          }}
        />
      </div>
      {isFull && (
        <p className="text-xs text-red-500 font-medium">
          Limit reached — upgrade your plan to add more drivers.
        </p>
      )}
    </div>
  );
}

// ─── Plan selector (SUPER_ADMIN — DB-driven) ──────────────────────────────────

function PlanSelector({ companyId }: { companyId: string }) {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [done,         setDone]         = useState(false);

  const { data: plans = [], isLoading } = usePlans();
  const { mutateAsync, isPending }      = useUpdateCompanyPlan();

  const activePlans = plans.filter((p) => p.isActive);

  async function handleSave() {
    if (!selectedSlug) return;
    await mutateAsync({ companyId, plan: selectedSlug });
    setSelectedSlug("");
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  if (isLoading) {
    return <Loader2 size={14} className="animate-spin text-slate-400" />;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {activePlans.map((p) => {
          const active       = selectedSlug === p.slug;
          const priceLabel   = p.priceMonthly === 0 ? "Custom" : `$${p.priceMonthly} / mo`;
          const driversLabel =
            p.maxDrivers === null ? "Unlimited drivers" : `Up to ${p.maxDrivers} drivers`;

          return (
            <button
              key={p.slug}
              onClick={() => setSelectedSlug(p.slug)}
              className="p-3 rounded-xl border text-left transition-all"
              style={
                active
                  ? { borderColor: "#2563eb", background: "#2563eb0f" }
                  : { borderColor: "#e2e8f0", background: "#fff" }
              }
            >
              <p
                className="text-xs font-bold mb-0.5 truncate"
                style={{ color: active ? "#2563eb" : "#0f172a" }}
              >
                {p.displayName}
              </p>
              <p className="text-[11px] text-slate-400">{priceLabel}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{driversLabel}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={!selectedSlug || isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
        style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
      >
        {isPending && <Loader2 size={13} className="animate-spin" />}
        {done ? (
          <>
            <CheckCircle2 size={13} /> Plan updated
          </>
        ) : (
          "Save plan change"
        )}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const user         = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin      = user?.role === "COMPANY_ADMIN";

  // ── Change password state ──────────────────────────────────────────────────
  const [changePwOpen, setChangePwOpen] = useState(false);
  const {
    mutateAsync: changePw,
    isPending:   changePwPending,
    error:       changePwRawError,
    reset:       resetPwMutation,
  } = useChangePassword();

  const changePwError =
    changePwRawError instanceof Error ? changePwRawError.message : null;

  async function handleChangePassword(newPassword: string) {
    if (!user?.id) return;
    await changePw({ id: user.id, newPassword });
    setChangePwOpen(false);
  }

  function closeChangePw() {
    setChangePwOpen(false);
    resetPwMutation();
  }

  // ── Plan info (non-admin roles) ───────────────────────────────────────────
  const { data: planInfo, isLoading: planLoading } = usePlanInfo(!isSuperAdmin);
  const { data: companies }                         = useAllCompanies(isSuperAdmin);

  return (
    <>
      <TopBar title="Settings" />
      <main className="flex-1 p-6 space-y-5 page-enter max-w-2xl">

        {/* ── Profile ──────────────────────────────────────────── */}
        <Section title="Profile">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: "var(--rt-gradient)" }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{user?.name ?? "—"}</p>
                {planInfo && (
                  <PlanBadge plan={planInfo.plan} displayName={planInfo.displayName} />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email ?? "—"}</p>
            </div>
          </div>
          <Field label="Full Name" value={user?.name ?? "—"} />
          <Field label="Email"     value={user?.email ?? "—"} />
          <Field label="Role"      value={user?.role  ?? "—"} />
        </Section>

        {/* ── Subscription & Plan ──────────────────────────────── */}
        {!isSuperAdmin && (
          <Section title="Subscription & Plan" icon={CreditCard}>
            {planLoading ? (
              <div className="py-4 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 size={15} className="animate-spin" /> Loading plan info…
              </div>
            ) : planInfo ? (
              <div className="space-y-4">

                {/* Plan card — highlighted */}
                <div
                  className="rounded-2xl p-5 border-2"
                  style={{
                    borderColor: PLAN_CONFIG[planInfo.plan as PlanName]?.color ?? "#2563eb",
                    background:  (PLAN_CONFIG[planInfo.plan as PlanName]?.color ?? "#2563eb") + "0d",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-extrabold text-slate-900">
                          {planInfo.displayName}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: PLAN_CONFIG[planInfo.plan as PlanName]?.color ?? "#2563eb" }}
                        >
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: PLAN_CONFIG[planInfo.plan as PlanName]?.color ?? "#2563eb" }}>
                        {planInfo.price}{planInfo.period && ` ${planInfo.period}`}
                      </p>
                    </div>
                    <PlanBadge plan={planInfo.plan} displayName={planInfo.displayName} size="md" />
                  </div>

                  {/* Driver usage bar inside card */}
                  <div className="mb-1">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                        <Users size={12} /> Driver seats
                      </span>
                      <span className="font-bold text-slate-700">
                        {planInfo.currentDrivers} / {planInfo.maxDrivers === null ? "∞" : planInfo.maxDrivers}
                      </span>
                    </div>
                    <DriverUsageBar current={planInfo.currentDrivers} max={planInfo.maxDrivers} />
                  </div>
                </div>

                {/* Features — all features, checked or locked by tier */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Features
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(FEATURE_LABELS) as (keyof typeof FEATURE_LABELS)[]).map((key) => {
                      const included = (planInfo.features as string[]).includes(key);
                      const minPlan  = FEATURE_MIN_PLAN[key];
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl"
                          style={{ background: included ? "#f0fdf4" : "#f8fafc" }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: included ? "#dcfce7" : "#f1f5f9" }}
                          >
                            {included
                              ? <CheckCircle2 size={12} className="text-emerald-500" />
                              : <Lock size={10} className="text-slate-300" />
                            }
                          </div>
                          <span
                            className="text-xs flex-1"
                            style={{ color: included ? "#166534" : "#94a3b8" }}
                          >
                            {FEATURE_LABELS[key]}
                          </span>
                          {!included && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                              style={{
                                background: (PLAN_CONFIG[minPlan]?.color ?? "#2563eb") + "15",
                                color:       PLAN_CONFIG[minPlan]?.color ?? "#2563eb",
                              }}
                            >
                              {PLAN_CONFIG[minPlan]?.displayName}+
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!isAdmin && (
                  <p className="text-xs text-slate-400 text-center pt-1">
                    Contact your administrator to change your plan.
                  </p>
                )}
              </div>
            ) : null}
          </Section>
        )}

        {/* ── SUPER_ADMIN: manage company plans ────────────────── */}
        {isSuperAdmin && companies && companies.length > 0 && (
          <Section title="Manage Company Plans" icon={CreditCard}>
            <p className="text-xs text-slate-500 -mt-1">
              Select a company and assign a new plan from the DB.
            </p>
            <div className="space-y-5 divide-y divide-slate-100">
              {companies.map((c) => (
                <div key={c.id} className="pt-4 first:pt-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: "var(--rt-gradient)" }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </div>
                    <div className="ml-auto">
                      <PlanBadge plan={c.plan ?? "starter"} />
                    </div>
                  </div>
                  <PlanSelector companyId={c.id} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Company ──────────────────────────────────────────── */}
        {!isSuperAdmin && (
          <Section title="Company" icon={Building2}>
            <Field label="Company ID" value={user?.companyId ?? "—"} />
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-blue-50 border border-blue-100">
              <Building2 size={15} className="text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 font-medium">
                Contact your administrator to update company information.
              </p>
            </div>
          </Section>
        )}

        {/* ── Security ─────────────────────────────────────────── */}
        <Section title="Security" icon={Shield}>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-800">Password</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your account password
                </p>
              </div>
            </div>
            <button
              onClick={() => setChangePwOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
            >
              Change
            </button>
          </div>
        </Section>

      </main>

      {/* ── Change password modal ─────────────────────────────── */}
      <ChangePasswordModal
        open={changePwOpen}
        userName={user?.name  ?? ""}
        userEmail={user?.email ?? ""}
        isSubmitting={changePwPending}
        error={changePwError}
        onSubmit={handleChangePassword}
        onClose={closeChangePw}
      />
    </>
  );
}
