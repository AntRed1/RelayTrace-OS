"use client";

import { useState } from "react";
import { TopBar } from "@/components/layouts/TopBar";
import { useAllTrips } from "@/hooks/use-trips";
import { useAllCompanies } from "@/hooks/use-companies";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2, Search, Building2 } from "lucide-react";
import { safeFormat } from "@/lib/utils";

const statusMap: Record<string, { bg: string; color: string; label: string }> =
  {
    confirmed: { bg: "#f0fdf4", color: "#16a34a", label: "Confirmed" },
    pending: { bg: "#fffbeb", color: "#d97706", label: "Pending" },
    flagged: { bg: "#fef2f2", color: "#dc2626", label: "Flagged" },
  };

const sourceMap: Record<string, string> = {
  manual: "Manual",
  ocr: "OCR",
  relay_email: "Relay Email",
};

export default function TripsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");

  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // Solo fetch si el usuario es SUPER_ADMIN — evita 403 para otros roles
  const { data: companies } = useAllCompanies(isSuperAdmin);

  const { data, isLoading } = useAllTrips({
    page,
    limit: 15,
    status: status || undefined,
    companyId: companyId || undefined,
  });

  const trips = data?.data ?? [];
  const meta = data?.meta;

  const selectedCompanyName = companies?.find((c) => c.id === companyId)?.name;

  return (
    <>
      <TopBar title="Trips" />
      <main className="flex-1 p-6 space-y-5 page-enter">
        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda por Trip ID (no conectada aún al hook) */}
          <div className="relative max-w-xs flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search trip ID..."
              className="w-full pl-8 pr-3.5 py-2 rounded-xl text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Selector de empresa — solo SUPER_ADMIN */}
          {isSuperAdmin && companies && companies.length > 0 && (
            <div className="relative">
              <Building2
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-8 py-2 rounded-xl text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 appearance-none cursor-pointer transition-all"
              >
                <option value="">All companies</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtros de estado */}
          <div className="flex items-center gap-1.5">
            {["", "pending", "confirmed", "flagged"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={
                  status === s
                    ? { background: "#2563eb", color: "#fff" }
                    : {
                        background: "#fff",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                      }
                }
              >
                {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Chip de empresa seleccionada */}
        {isSuperAdmin && selectedCompanyName && (
          <p className="text-xs text-slate-500">
            Showing trips for{" "}
            <span className="font-semibold text-blue-600">
              {selectedCompanyName}
            </span>
          </p>
        )}

        <div
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{ boxShadow: "var(--rt-shadow-sm)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Trip ID",
                  ...(isSuperAdmin ? ["Company"] : []),
                  "Driver",
                  "Registered",
                  "Source",
                  "Status",
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
                  <td
                    colSpan={isSuperAdmin ? 6 : 5}
                    className="px-5 py-12 text-center"
                  >
                    <Loader2
                      size={20}
                      className="animate-spin text-blue-500 mx-auto"
                    />
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 6 : 5}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No trips found
                  </td>
                </tr>
              ) : (
                trips.map((trip, i) => {
                  const s = statusMap[trip.status] ?? statusMap.pending;
                  const companyName = companies?.find(
                    (c) => c.id === trip.companyId,
                  )?.name;

                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50/70 transition-colors"
                      style={{
                        borderBottom:
                          i < trips.length - 1 ? "1px solid #f8fafc" : "none",
                      }}
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {trip.tripId}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {companyName ?? (
                            <span className="font-mono text-slate-300">
                              {trip.companyId.slice(0, 8)}…
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800">
                          {trip.driver?.name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {trip.driver?.email ?? ""}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {safeFormat(trip.registeredAt, "MMM d, yyyy · h:mm a")}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 capitalize">
                        {sourceMap[trip.sourceType] ?? trip.sourceType}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {meta && meta.totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {meta.total} trips · page {meta.page} of {meta.totalPages}
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
