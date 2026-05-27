"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  X,
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  Users,
  MessageSquare,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { TopBar } from "@/components/layouts/TopBar";
import {
  useCompanyRequests,
  useProcessRequest,
  useOnboardCompany,
} from "@/hooks/use-companies";
import { PlanBadge } from "@/components/plan/PlanBadge";
import { PLAN_CONFIG, PlanName } from "@/config/plan.config";
import { CompanyRequest, CompanyRequestStatus } from "@/types";
import { safeFormat } from "@/lib/utils";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const onboardSchema = z.object({
  adminEmail: z.string().email("Valid email required"),
  adminName:  z.string().min(2, "Name is required"),
  temporaryPassword: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
  plan: z.enum(["starter", "growth", "fleet"]).optional(),
});
type OnboardForm = z.infer<typeof onboardSchema>;

const rejectSchema = z.object({
  notes: z.string().max(500).optional(),
});
type RejectForm = z.infer<typeof rejectSchema>;

// ─── Status config ────────────────────────────────────────────────────────────

type TabValue = CompanyRequestStatus | "all";

const TABS: { value: TabValue; label: string; icon: React.ElementType }[] = [
  { value: "all",      label: "All",      icon: ClipboardList },
  { value: "pending",  label: "Pending",  icon: Clock },
  { value: "approved", label: "Approved", icon: CheckCircle2 },
  { value: "rejected", label: "Rejected", icon: XCircle },
];

const STATUS_STYLES: Record<
  CompanyRequestStatus,
  { bg: string; color: string; label: string }
> = {
  pending:  { bg: "#fefce8", color: "#ca8a04", label: "Pending" },
  approved: { bg: "#f0fdf4", color: "#16a34a", label: "Approved" },
  rejected: { bg: "#fef2f2", color: "#dc2626", label: "Rejected" },
};

// ─── Onboard Modal ────────────────────────────────────────────────────────────

interface OnboardModalProps {
  request: CompanyRequest;
  onClose: () => void;
}

function OnboardModal({ request, onClose }: OnboardModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState<{
    company: string;
    adminEmail: string;
  } | null>(null);

  const { mutateAsync, isPending } = useOnboardCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardForm>({ resolver: zodResolver(onboardSchema) });

  const onSubmit = async (form: OnboardForm) => {
    const result = await mutateAsync({
      id: request.id,
      dto: {
        adminEmail:        form.adminEmail,
        adminName:         form.adminName,
        temporaryPassword: form.temporaryPassword,
        plan:              (form.plan ?? "starter") as PlanName,
      },
    });
    setDone({ company: result.company.name, adminEmail: result.admin.email });
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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
              Onboard Company
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Creates the company account and its first admin user
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-7 py-6">
          {done ? (
            /* ── Success state ─────────────────────────────── */
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {done.company} is live!
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Admin account created for{" "}
                <span className="font-semibold text-slate-700">
                  {done.adminEmail}
                </span>
                . Share the temporary password with them.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Form ──────────────────────────────────────── */
            <>
              {/* Request summary */}
              <div
                className="rounded-2xl p-4 mb-5 space-y-2 text-sm"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Building2 size={14} className="text-blue-500" />
                  {request.companyName}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <User size={13} />
                  {request.contactName}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail size={13} />
                  {request.email}
                </div>
                {request.phone && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={13} />
                    {request.phone}
                  </div>
                )}
                {request.driverCount && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users size={13} />
                    {request.driverCount} drivers (estimated)
                  </div>
                )}
                {request.notes && (
                  <div className="flex items-start gap-2 text-slate-500">
                    <MessageSquare size={13} className="mt-0.5 shrink-0" />
                    <span className="text-xs leading-relaxed">{request.notes}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Admin email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Admin Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("adminEmail")}
                    type="email"
                    defaultValue={request.email}
                    placeholder="admin@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                  />
                  {errors.adminEmail && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.adminEmail.message}
                    </p>
                  )}
                </div>

                {/* Admin name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Admin Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("adminName")}
                    defaultValue={request.contactName}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                  />
                  {errors.adminName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.adminName.message}
                    </p>
                  )}
                </div>

                {/* Temporary password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Temporary Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      {...register("temporaryPassword")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.temporaryPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.temporaryPassword.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    The admin must change this on first login.
                  </p>
                </div>

                {/* Plan selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Plan de acceso
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(PLAN_CONFIG) as PlanName[]).map((p) => {
                      const cfg = PLAN_CONFIG[p];
                      const field = "plan" as const;
                      return (
                        <label
                          key={p}
                          className="cursor-pointer p-2.5 rounded-xl border text-center transition-all"
                          style={{
                            borderColor: "#e2e8f0",
                          }}
                        >
                          <input
                            type="radio"
                            {...register("plan")}
                            value={p}
                            className="sr-only"
                          />
                          <PlanBadge plan={p} />
                          <p className="text-[11px] text-slate-400 mt-1">
                            {cfg.price}
                            {cfg.period && ` ${cfg.period}`}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {cfg.maxDrivers === 0
                              ? "Ilimitado"
                              : `≤ ${cfg.maxDrivers} conductores`}
                          </p>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
                >
                  {isPending && <Loader2 size={15} className="animate-spin" />}
                  {isPending ? "Creating account…" : "Activate & Onboard"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

interface RejectModalProps {
  request: CompanyRequest;
  onClose: () => void;
}

function RejectModal({ request, onClose }: RejectModalProps) {
  const [done, setDone] = useState(false);
  const { mutateAsync, isPending } = useProcessRequest();

  const { register, handleSubmit } = useForm<RejectForm>({
    resolver: zodResolver(rejectSchema),
  });

  const onSubmit = async (form: RejectForm) => {
    await mutateAsync({ id: request.id, dto: { status: "rejected", notes: form.notes } });
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div
          className="px-7 py-5 flex items-center justify-between border-b border-slate-100"
          style={{ background: "linear-gradient(135deg,#450a0a,#7f1d1d)" }}
        >
          <div>
            <h2 className="text-base font-bold text-white">Reject Request</h2>
            <p className="text-xs text-red-300 mt-0.5">
              {request.companyName} — {request.contactName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-7 py-6">
          {done ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <XCircle size={24} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Request rejected.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Reason{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="e.g. Duplicate request, incomplete info…"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 placeholder:text-slate-400 transition-all resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-all"
                >
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  Reject Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Accordion ─────────────────────────────────────────────────────────

function RequestDetails({ request }: { request: CompanyRequest }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
      >
        Details
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 space-y-1 text-xs text-slate-500">
          {request.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={11} /> {request.phone}
            </div>
          )}
          {request.driverCount && (
            <div className="flex items-center gap-1.5">
              <Users size={11} /> {request.driverCount} drivers
            </div>
          )}
          {request.notes && (
            <div className="flex items-start gap-1.5">
              <MessageSquare size={11} className="mt-0.5 shrink-0" />
              <span className="leading-relaxed">{request.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [tab,            setTab]            = useState<TabValue>("pending");
  const [onboarding,     setOnboarding]     = useState<CompanyRequest | null>(null);
  const [rejecting,      setRejecting]      = useState<CompanyRequest | null>(null);

  const { data: requests, isLoading } = useCompanyRequests(
    tab === "all" ? undefined : tab,
  );

  const rows = requests ?? [];

  // ── Tab counts (always fetch all for the badge) ───────────────────────────
  const { data: allRequests } = useCompanyRequests(undefined);
  const countByStatus = (s: CompanyRequestStatus) =>
    (allRequests ?? []).filter((r) => r.status === s).length;

  return (
    <>
      <TopBar title="Onboarding" />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <p className="text-sm text-slate-500">
            Review company access requests and activate new accounts.
          </p>
        </div>

        {/* ── Stat chips ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          {(["pending", "approved", "rejected"] as CompanyRequestStatus[]).map(
            (s) => {
              const style = STATUS_STYLES[s];
              return (
                <div
                  key={s}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:opacity-80"
                  style={{
                    background: style.bg,
                    borderColor: style.color + "33",
                    color: style.color,
                  }}
                  onClick={() => setTab(s)}
                >
                  {s === "pending"  && <Clock        size={14} />}
                  {s === "approved" && <CheckCircle2 size={14} />}
                  {s === "rejected" && <XCircle      size={14} />}
                  <span className="capitalize">{style.label}</span>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: style.color + "22" }}
                  >
                    {countByStatus(s)}
                  </span>
                </div>
              );
            },
          )}
        </div>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={
                tab === value
                  ? { background: "#2563eb", color: "#fff" }
                  : { background: "#fff", color: "#64748b", border: "1px solid #e2e8f0" }
              }
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Table ───────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{ boxShadow: "var(--rt-shadow-sm)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Company", "Contact", "Email", "Drivers", "Requested", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2
                      size={20}
                      className="animate-spin text-blue-500 mx-auto"
                    />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No{tab !== "all" ? ` ${tab}` : ""} requests found.
                  </td>
                </tr>
              ) : (
                rows.map((req, i) => {
                  const s = STATUS_STYLES[req.status];
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/70 transition-colors"
                      style={{
                        borderBottom:
                          i < rows.length - 1 ? "1px solid #f8fafc" : "none",
                      }}
                    >
                      {/* Company */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{
                              background: "linear-gradient(135deg,#22d3ee,#2563eb)",
                            }}
                          >
                            {req.companyName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">
                            {req.companyName}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <p className="text-slate-700 font-medium">
                          {req.contactName}
                        </p>
                        <RequestDetails request={req} />
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {req.email}
                      </td>

                      {/* Driver count */}
                      <td className="px-5 py-3.5 text-slate-500 text-center">
                        {req.driverCount ?? (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs text-slate-400">
                        {safeFormat(req.createdAt, "MMM d, yyyy")}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        {req.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setOnboarding(req)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                              style={{
                                background:
                                  "linear-gradient(135deg,#22d3ee,#2563eb)",
                              }}
                            >
                              Onboard
                            </button>
                            <button
                              onClick={() => setRejecting(req)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all border border-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {req.status === "approved" ? "Activated" : "Closed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {onboarding && (
        <OnboardModal
          request={onboarding}
          onClose={() => setOnboarding(null)}
        />
      )}
      {rejecting && (
        <RejectModal
          request={rejecting}
          onClose={() => setRejecting(null)}
        />
      )}
    </>
  );
}
