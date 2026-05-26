"use client";

import { useState } from "react";
import { TopBar } from "@/components/layouts/TopBar";
import { useDrivers } from "@/hooks/use-drivers";
import { Loader2, Search } from "lucide-react";
import { safeFormat } from "@/lib/utils";

const statusMap = {
  active: { bg: "#f0fdf4", color: "#16a34a", label: "Active" },
  inactive: { bg: "#f1f5f9", color: "#64748b", label: "Inactive" },
};

export default function DriversPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDrivers(page, 15);
  const drivers = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <TopBar title="Drivers" />
      <main className="flex-1 p-6 space-y-5 page-enter">
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search driver..."
              className="w-full pl-8 pr-3.5 py-2 rounded-xl text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
            />
          </div>
        </div>

        <div
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{ boxShadow: "var(--rt-shadow-sm)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Driver", "Email", "Role", "Joined", "Status"].map((h) => (
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
              ) : drivers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No drivers found
                  </td>
                </tr>
              ) : (
                drivers.map((driver, i) => {
                  const s =
                    statusMap[driver.status as keyof typeof statusMap] ??
                    statusMap.inactive;
                  return (
                    <tr
                      key={driver.id}
                      className="hover:bg-slate-50/70 transition-colors"
                      style={{
                        borderBottom:
                          i < drivers.length - 1 ? "1px solid #f8fafc" : "none",
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: "var(--rt-gradient)" }}
                          >
                            {driver.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">
                            {driver.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {driver.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          {driver.role?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">
                        {safeFormat(driver.createdAt, "MMM d, yyyy")}
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
                {meta.total} drivers · page {meta.page} of {meta.totalPages}
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
