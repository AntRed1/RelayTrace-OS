"use client";

import { useState } from "react";
import { TopBar } from "@/components/layouts/TopBar";
import { useEmployees } from "@/hooks/use-users";
import { useAllCompanies } from "@/hooks/use-companies";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2, Building2 } from "lucide-react";
import { safeFormat } from "@/lib/utils";
import { EmployeeRole } from "@/services/users.service";

// ─── Config ──────────────────────────────────────────────────────────────────

const statusMap = {
  active: { bg: "#f0fdf4", color: "#16a34a", label: "Active" },
  inactive: { bg: "#f1f5f9", color: "#64748b", label: "Inactive" },
};

const roleLabels: Record<string, string> = {
  DRIVER: "Driver",
  DISPATCHER: "Dispatcher",
  COMPANY_ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

type RoleTab = { value: EmployeeRole | ""; label: string };

const ROLE_TABS: RoleTab[] = [
  { value: "", label: "All" },
  { value: "DRIVER", label: "Drivers" },
  { value: "DISPATCHER", label: "Dispatchers" },
  { value: "COMPANY_ADMIN", label: "Admins" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DriversPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<EmployeeRole | "">("");
  const [companyId, setCompanyId] = useState("");

  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const { data: companies } = useAllCompanies(isSuperAdmin);

  const { data, isLoading } = useEmployees({
    page,
    limit: 15,
    role: role || undefined,
    companyId: companyId || undefined,
  });

  const employees = data?.data ?? [];
  const meta = data?.meta;

  const selectedCompanyName = companies?.find((c) => c.id === companyId)?.name;

  const colCount = isSuperAdmin ? 6 : 5;

  return (
    <>
      <TopBar title="People" />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">

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

          {/* Tabs de rol */}
          <div className="flex items-center gap-1.5">
            {ROLE_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setRole(value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={
                  role === value
                    ? { background: "#2563eb", color: "#fff" }
                    : {
                        background: "#fff",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                      }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chip de empresa seleccionada */}
        {isSuperAdmin && selectedCompanyName && (
          <p className="text-xs text-slate-500">
            Showing employees for{" "}
            <span className="font-semibold text-blue-600">
              {selectedCompanyName}
            </span>
          </p>
        )}

        {/* ── Table ───────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{ boxShadow: "var(--rt-shadow-sm)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Employee",
                  "Email",
                  ...(isSuperAdmin ? ["Company"] : []),
                  "Role",
                  "Joined",
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
                  <td colSpan={colCount} className="px-5 py-12 text-center">
                    <Loader2
                      size={20}
                      className="animate-spin text-blue-500 mx-auto"
                    />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    {isSuperAdmin && !companyId
                      ? "Select a company to see its employees, or leave blank to see all."
                      : "No employees found"}
                  </td>
                </tr>
              ) : (
                employees.map((emp, i) => {
                  const s =
                    statusMap[emp.status as keyof typeof statusMap] ??
                    statusMap.inactive;
                  const companyName = companies?.find(
                    (c) => c.id === emp.companyId,
                  )?.name;

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/70 transition-colors"
                      style={{
                        borderBottom:
                          i < employees.length - 1
                            ? "1px solid #f8fafc"
                            : "none",
                      }}
                    >
                      {/* Name + avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: "var(--rt-gradient)" }}
                          >
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">
                            {emp.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-slate-500">
                        {emp.email}
                      </td>

                      {/* Company (solo SUPER_ADMIN) */}
                      {isSuperAdmin && (
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {companyName ?? (
                            <span className="font-mono text-slate-300">
                              {emp.companyId?.slice(0, 8)}…
                            </span>
                          )}
                        </td>
                      )}

                      {/* Role badge */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          {roleLabels[emp.role?.name ?? ""] ?? emp.role?.name ?? "—"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 text-xs text-slate-400">
                        {safeFormat(emp.createdAt, "MMM d, yyyy")}
                      </td>

                      {/* Status */}
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
                {meta.total} employees · page {meta.page} of {meta.totalPages}
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
