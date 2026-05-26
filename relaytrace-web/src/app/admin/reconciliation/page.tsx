"use client";

import { useState } from "react";
import { TopBar } from "@/components/layouts/TopBar";
import {
  useReconciliation,
  useReconciliationSummary,
} from "@/hooks/use-reconciliation";
import { format } from "date-fns";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function ReconciliationPage() {
  const [page, setPage] = useState(1);
  const { data: summary } = useReconciliationSummary();
  const { data, isLoading } = useReconciliation(page, 15);

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <TopBar title="Reconciliation" />
      <main className="flex-1 p-6 space-y-5 page-enter">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Processed",
              value: summary?.total ?? 0,
              icon: AlertCircle,
              color: "#2563eb",
              bg: "#eff6ff",
            },
            {
              label: "Matched",
              value: summary?.matched ?? 0,
              icon: CheckCircle2,
              color: "#16a34a",
              bg: "#f0fdf4",
            },
            {
              label: "Unmatched",
              value: summary?.unmatched ?? 0,
              icon: XCircle,
              color: "#dc2626",
              bg: "#fef2f2",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4"
              style={{ boxShadow: "var(--rt-shadow-sm)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Match rate bar */}
        {summary && (
          <div
            className="bg-white rounded-2xl p-5 border border-slate-200"
            style={{ boxShadow: "var(--rt-shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Match Rate
              </p>
              <span className="text-sm font-bold text-slate-800">
                {summary.matchRate.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${summary.matchRate}%`,
                  background: "var(--rt-gradient)",
                }}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{ boxShadow: "var(--rt-shadow-sm)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Relay Trip ID",
                  "Driver Trip",
                  "Matched",
                  "Discrepancy",
                  "Checked At",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Loader2
                      size={20}
                      className="animate-spin text-blue-500 mx-auto"
                    />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No reconciliation records yet
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                    style={{
                      borderBottom:
                        i < items.length - 1 ? "1px solid #f8fafc" : "none",
                    }}
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {item.relayEmailLog?.relayTripId ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {item.trip?.tripId ?? (
                        <span className="text-slate-300">not found</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {item.matched ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                          <CheckCircle2 size={12} /> Matched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600">
                          <XCircle size={12} /> Unmatched
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                      {item.discrepancyReason ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {format(new Date(item.checkedAt), "MMM d · h:mm a")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {meta && meta.totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {meta.total} records · page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-all"
                >
                  ← Prev
                </button>
                <button
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
