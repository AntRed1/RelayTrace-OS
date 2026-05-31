"use client";

import { useState }      from "react";
import { TopBar }        from "@/components/layouts/TopBar";
import { useAuditLogs }  from "@/hooks/use-audit";
import { useAuthStore }  from "@/stores/auth.store";
import { safeFormat }    from "@/lib/utils";
import {
  Loader2,
  ShieldCheck,
  Building2,
  RotateCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// ─── Action badge config ──────────────────────────────────────────────────────

const ACTION_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  login:           { bg: "#f0fdf4", color: "#16a34a", label: "Login"           },
  logout:          { bg: "#f8fafc", color: "#64748b", label: "Logout"          },
  create_trip:     { bg: "#eff6ff", color: "#2563eb", label: "Trip created"    },
  update_trip:     { bg: "#eff6ff", color: "#2563eb", label: "Trip updated"    },
  delete_trip:     { bg: "#fef2f2", color: "#dc2626", label: "Trip deleted"    },
  create_user:     { bg: "#f5f3ff", color: "#7c3aed", label: "User created"    },
  update_user:     { bg: "#f5f3ff", color: "#7c3aed", label: "User updated"    },
  delete_user:     { bg: "#fef2f2", color: "#dc2626", label: "User deleted"    },
  change_password: { bg: "#fef3c7", color: "#92400e", label: "Password change" },
  revoke_access:   { bg: "#fef2f2", color: "#dc2626", label: "Access revoked"  },
  restore_access:  { bg: "#f0fdf4", color: "#16a34a", label: "Access restored" },
  create_plan:     { bg: "#ecfeff", color: "#0891b2", label: "Plan created"    },
  update_plan:     { bg: "#ecfeff", color: "#0891b2", label: "Plan updated"    },
  delete_plan:     { bg: "#fef2f2", color: "#dc2626", label: "Plan deleted"    },
  approve_company: { bg: "#f0fdf4", color: "#16a34a", label: "Company approved"},
  reject_company:  { bg: "#fef2f2", color: "#dc2626", label: "Company rejected"},
};

function ActionBadge({ action }: { action: string }) {
  const s = ACTION_STYLE[action] ?? { bg: "#f1f5f9", color: "#64748b", label: action };
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ─── Action filter options ────────────────────────────────────────────────────

const ACTION_OPTIONS = [
  { value: "",                label: "All actions"      },
  { value: "login",           label: "Login"            },
  { value: "create_trip",     label: "Trip created"     },
  { value: "delete_trip",     label: "Trip deleted"     },
  { value: "create_user",     label: "User created"     },
  { value: "update_user",     label: "User updated"     },
  { value: "delete_user",     label: "User deleted"     },
  { value: "change_password", label: "Password change"  },
  { value: "revoke_access",   label: "Access revoked"   },
  { value: "restore_access",  label: "Access restored"  },
  { value: "create_plan",     label: "Plan created"     },
  { value: "update_plan",     label: "Plan updated"     },
  { value: "delete_plan",     label: "Plan deleted"     },
  { value: "approve_company", label: "Company approved" },
  { value: "reject_company",  label: "Company rejected" },
];

// ─── Shared select style ──────────────────────────────────────────────────────

const selectCls =
  "px-3 py-2 rounded-xl text-sm bg-white border border-slate-200 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 " +
  "text-slate-700 appearance-none cursor-pointer transition-all";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const authUser     = useAuthStore((s) => s.user);
  const isSuperAdmin = authUser?.role === "SUPER_ADMIN";
  const qc           = useQueryClient();

  const [page,   setPage]   = useState(1);
  const [action, setAction] = useState("");
  const [from,   setFrom]   = useState("");
  const [to,     setTo]     = useState("");

  const { data, isLoading } = useAuditLogs({
    page,
    limit:  25,
    action: action || undefined,
    from:   from   || undefined,
    to:     to     || undefined,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  async function refreshLogs() {
    await qc.invalidateQueries({ queryKey: ["audit"] });
  }

  function resetFilters() {
    setAction(""); setFrom(""); setTo(""); setPage(1);
  }

  const hasFilters = !!action || !!from || !!to;

  return (
    <>
      <TopBar title="Audit Log">
        <button
          onClick={refreshLogs}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          title="Refresh logs"
        >
          <RotateCw size={17} />
        </button>
      </TopBar>
      <main className="flex-1 p-6 space-y-5 page-enter overflow-auto">

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Action filter */}
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className={selectCls}
            >
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 shrink-0">From</span>
              <input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                className={selectCls}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 shrink-0">To</span>
              <input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                className={selectCls}
              />
            </div>

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {meta && (
            <p className="text-xs text-slate-400">
              {meta.total.toLocaleString()} event{meta.total !== 1 ? "s" : ""}
            </p>
          )}
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
                  {[
                    "Timestamp",
                    "Event",
                    "User",
                    ...(isSuperAdmin ? ["Company"] : []),
                    "Details",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-5 py-14 text-center">
                      <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: "#f8fafc" }}
                        >
                          <ShieldCheck size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400">No audit events found</p>
                        {hasFilters && (
                          <button
                            onClick={resetFilters}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 transition-colors"
                      style={{ borderBottom: i < logs.length - 1 ? "1px solid #f8fafc" : "none" }}
                    >
                      {/* Timestamp + IP */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs text-slate-700 font-medium font-mono">
                          {safeFormat(log.createdAt, "MMM d, yyyy · HH:mm:ss")}
                        </p>
                        {log.ipAddress && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {log.ipAddress}
                          </p>
                        )}
                      </td>

                      {/* Action badge */}
                      <td className="px-5 py-3.5">
                        <ActionBadge action={log.action} />
                      </td>

                      {/* User */}
                      <td className="px-5 py-3.5 min-w-[160px]">
                        {log.userName ? (
                          <>
                            <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                              {log.userName}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-[180px]">
                              {log.userEmail}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-300 font-mono">
                            {log.userId?.slice(0, 8) ?? "—"}
                          </span>
                        )}
                      </td>

                      {/* Company — SUPER_ADMIN only */}
                      {isSuperAdmin && (
                        <td className="px-5 py-3.5">
                          {log.companyName ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                              <Building2 size={10} />
                              {log.companyName}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-slate-300">
                              {log.companyId.slice(0, 8)}…
                            </span>
                          )}
                        </td>
                      )}

                      {/* Details (metadata summary) */}
                      <td className="px-5 py-3.5 max-w-[260px]">
                        <MetadataSummary action={log.action} metadata={log.metadata} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Page {meta.page} of {meta.totalPages} · {meta.total} events
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-all"
                >
                  ← Prev
                </button>
                <button
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">
          Events are immutable. Retention follows your data policy.
        </p>
      </main>
    </>
  );
}

// ─── Metadata summary ─────────────────────────────────────────────────────────

function MetadataSummary({
  action,
  metadata,
}: {
  action:   string;
  metadata: Record<string, unknown>;
}) {
  const str = (k: string) => (metadata[k] as string | undefined) ?? null;
  const bool = (k: string) => metadata[k] as boolean | undefined;

  if (action === "login") {
    return <Meta label="via" value={str("email")} />;
  }
  if (action === "create_trip" || action === "delete_trip") {
    return <Meta label="relay ID" value={str("relayTripId") ?? str("tripId")} />;
  }
  if (action === "create_user" || action === "delete_user") {
    return <Meta label="email" value={str("email") ?? str("targetEmail")} />;
  }
  if (action === "update_user" || action === "revoke_access" || action === "restore_access") {
    return <Meta label="target" value={str("targetEmail")} />;
  }
  if (action === "change_password") {
    return (
      <Meta
        label={bool("isSelfChange") ? "self" : "target"}
        value={str("targetEmail")}
      />
    );
  }
  if (action === "create_plan" || action === "update_plan" || action === "delete_plan") {
    return <Meta label="plan" value={str("displayName") ?? str("slug")} />;
  }
  if (action === "approve_company" || action === "reject_company") {
    return <Meta label="company" value={str("companyName") ?? str("email")} />;
  }

  // Fallback: show raw keys
  const keys = Object.keys(metadata).slice(0, 2);
  if (keys.length === 0) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className="font-mono text-[11px] text-slate-400 truncate block">
      {keys.map((k) => `${k}: ${String(metadata[k]).slice(0, 20)}`).join(" · ")}
    </span>
  );
}

function Meta({ label, value }: { label: string; value: string | null }) {
  if (!value) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className="text-xs text-slate-500 truncate block max-w-[240px]">
      <span className="text-slate-400">{label}:</span>{" "}
      <span className="font-medium text-slate-700">{value}</span>
    </span>
  );
}
