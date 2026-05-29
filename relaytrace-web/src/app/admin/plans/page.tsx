"use client";

import { useState }         from "react";
import { TopBar }           from "@/components/layouts/TopBar";
import { PlanFormModal }    from "@/components/plans/PlanFormModal";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useRemovePlan,
} from "@/hooks/use-plans";
import { useAuthStore }     from "@/stores/auth.store";
import { Plan, CreatePlanPayload } from "@/types";
import { safeFormat }       from "@/lib/utils";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Star,
  AlertTriangle,
  X,
  Zap,
  CreditCard,
} from "lucide-react";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: active ? "#f0fdf4" : "#f1f5f9",
        color:      active ? "#16a34a" : "#64748b",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: active ? "#22c55e" : "#94a3b8",
          animation:  active ? "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" : "none",
        }}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Stripe sync indicator ─────────────────────────────────────────────────────

function StripeBadge({ priceId }: { priceId: string | null }) {
  return priceId ? (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg"
      style={{ background: "#f0fdf4", color: "#16a34a" }}
      title={priceId}
    >
      <Zap size={10} />
      Synced
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg"
      style={{ background: "#fef3c7", color: "#92400e" }}
      title="No Stripe Price ID"
    >
      <AlertTriangle size={10} />
      No Stripe
    </span>
  );
}

// ─── Deactivate confirm dialog ────────────────────────────────────────────────

function DeactivateDialog({
  plan,
  isDeactivating,
  onConfirm,
  onClose,
}: {
  plan:           Plan;
  isDeactivating: boolean;
  onConfirm:      () => void;
  onClose:        () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        <div className="h-1" style={{ background: "linear-gradient(90deg,#f97316,#ef4444)" }} />

        <div className="px-6 pt-5 pb-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#fef2f2" }}
            >
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">Deactivate plan?</h3>
          <p className="text-sm text-slate-500 mb-5">
            <strong className="text-slate-700">"{plan.displayName}"</strong> will be hidden from the
            pricing page. Companies already subscribed to this plan are not affected.
          </p>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeactivating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
            >
              {isDeactivating && <Loader2 size={14} className="animate-spin" />}
              {isDeactivating ? "Deactivating…" : "Deactivate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error extractor ──────────────────────────────────────────────────────────

function extractError(err: unknown): string {
  const msg = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(", ") : (msg ?? "Something went wrong");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const authUser     = useAuthStore((s) => s.user);
  const isSuperAdmin = authUser?.role === "SUPER_ADMIN";

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [formError,    setFormError]    = useState<string | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: plans = [], isLoading } = usePlans();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const removePlan = useRemovePlan();

  // ── Submit handlers ───────────────────────────────────────────────────────

  async function handleCreate(payload: CreatePlanPayload) {
    setFormError(null);
    try {
      await createPlan.mutateAsync(payload);
      setCreateOpen(false);
    } catch (err) {
      setFormError(extractError(err));
    }
  }

  async function handleUpdate(payload: CreatePlanPayload) {
    if (!editTarget) return;
    setFormError(null);
    try {
      await updatePlan.mutateAsync({ id: editTarget.id, payload });
      setEditTarget(null);
    } catch (err) {
      setFormError(extractError(err));
    }
  }

  async function handleDeactivate() {
    if (!deleteTarget) return;
    try {
      await removePlan.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Dialog stays open so user can retry
    }
  }

  // ── Sort by sortOrder ──────────────────────────────────────────────────────
  const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  // Soft guard — middleware is the primary gate
  if (!isSuperAdmin) return null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <TopBar title="Plans" />
      <main className="flex-1 p-6 space-y-5 page-enter overflow-auto">

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Manage subscription plans. Public pricing page updates within 5&nbsp;minutes via ISR.
          </p>
          <button
            onClick={() => { setFormError(null); setCreateOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
          >
            <Plus size={15} />
            New plan
          </button>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #f8fafc" }}>
                  {["#", "Plan", "Price", "Drivers", "Popular", "Stripe", "Status", "Updated", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider"
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
                    <td colSpan={9} className="px-5 py-14 text-center">
                      <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: "#f8fafc" }}
                        >
                          <CreditCard size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400">No plans yet</p>
                        <button
                          onClick={() => { setFormError(null); setCreateOpen(true); }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          + Create your first plan
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sorted.map((plan, i) => (
                    <tr
                      key={plan.id}
                      className="group hover:bg-slate-50/60 transition-colors"
                      style={{
                        borderBottom: i < sorted.length - 1 ? "1px solid #f8fafc" : "none",
                        opacity: plan.isActive ? 1 : 0.6,
                      }}
                    >
                      {/* Sort order */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-300">{plan.sortOrder}</span>
                      </td>

                      {/* Plan identity */}
                      <td className="px-5 py-3.5 min-w-[200px]">
                        <p className="font-semibold text-slate-800">{plan.displayName}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[240px]">
                          {plan.description}
                        </p>
                        <span className="font-mono text-[10px] text-slate-300">{plan.slug}</span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-800">
                          {plan.priceMonthly === 0 ? (
                            <span className="text-slate-400 font-medium">Custom</span>
                          ) : (
                            `$${plan.priceMonthly % 1 === 0 ? plan.priceMonthly : plan.priceMonthly.toFixed(2)}`
                          )}
                        </span>
                        {plan.priceMonthly > 0 && (
                          <span className="text-xs text-slate-400 ml-1">/mo</span>
                        )}
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                          {plan.currency}
                        </p>
                      </td>

                      {/* Driver cap */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {plan.maxDrivers === null
                            ? <span>∞&nbsp;<span className="text-slate-400 font-normal">Unlimited</span></span>
                            : `Up to ${plan.maxDrivers}`}
                        </span>
                      </td>

                      {/* Popular star */}
                      <td className="px-5 py-3.5">
                        {plan.isPopular ? (
                          <Star size={15} className="text-amber-400 fill-amber-400" />
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </td>

                      {/* Stripe status */}
                      <td className="px-5 py-3.5">
                        <StripeBadge priceId={plan.stripePriceId} />
                      </td>

                      {/* Active status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge active={plan.isActive} />
                      </td>

                      {/* Updated at */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {safeFormat(plan.updatedAt, "MMM d, yyyy")}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setFormError(null); setEditTarget(plan); }}
                            title="Edit plan"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <Pencil size={14} />
                          </button>

                          {plan.isActive && (
                            <button
                              onClick={() => setDeleteTarget(plan)}
                              title="Deactivate plan"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400">
          Deactivated plans remain assigned to existing subscriptions · Stripe prices are immutable;
          a price change provisions a new Price ID automatically.
        </p>
      </main>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      <PlanFormModal
        open={createOpen}
        mode="create"
        isSubmitting={createPlan.isPending}
        error={formError}
        onSubmit={handleCreate}
        onClose={() => { setCreateOpen(false); setFormError(null); }}
      />

      <PlanFormModal
        open={!!editTarget}
        mode="edit"
        initialData={editTarget ?? undefined}
        isSubmitting={updatePlan.isPending}
        error={formError}
        onSubmit={handleUpdate}
        onClose={() => { setEditTarget(null); setFormError(null); }}
      />

      {deleteTarget && (
        <DeactivateDialog
          plan={deleteTarget}
          isDeactivating={removePlan.isPending}
          onConfirm={handleDeactivate}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
