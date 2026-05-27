"use client";

import { useState } from "react";
import { TopBar }          from "@/components/layouts/TopBar";
import { UserFormModal, UserFormInitialData } from "@/components/people/UserFormModal";
import { DeleteUserModal } from "@/components/people/DeleteUserModal";
import {
  useEmployees,
  useRoles,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useRevokeAccess,
  useRestoreAccess,
} from "@/hooks/use-users";
import { useAllCompanies, usePlanInfo } from "@/hooks/use-companies";
import { useAuthStore }    from "@/stores/auth.store";
import { safeFormat }      from "@/lib/utils";
import { EmployeeRole }    from "@/services/users.service";
import {
  Loader2,
  Building2,
  Users,
  UserPlus,
  Pencil,
  ShieldOff,
  ShieldCheck,
  Trash2,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  active:   { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", label: "Active"   },
  inactive: { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8", label: "Inactive" },
};

const ROLE_MAP: Record<string, { label: string; bg: string; color: string }> = {
  DRIVER:        { label: "Driver",        bg: "#eff6ff", color: "#2563eb" },
  DISPATCHER:    { label: "Dispatcher",    bg: "#f5f3ff", color: "#7c3aed" },
  COMPANY_ADMIN: { label: "Admin",         bg: "#ecfeff", color: "#0891b2" },
  SUPER_ADMIN:   { label: "Super Admin",   bg: "#fffbeb", color: "#d97706" },
};

type RoleTab = { value: EmployeeRole | ""; label: string };

const ROLE_TABS: RoleTab[] = [
  { value: "",             label: "All"         },
  { value: "DRIVER",       label: "Drivers"     },
  { value: "DISPATCHER",   label: "Dispatchers" },
  { value: "COMPANY_ADMIN",label: "Admins"      },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const [page,      setPage]      = useState(1);
  const [role,      setRole]      = useState<EmployeeRole | "">("");
  const [companyId, setCompanyId] = useState("");

  // ── modal state ───────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState<UserFormInitialData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; email: string } | null>(null);
  const [formError, setFormError]       = useState<string | null>(null);

  const authUser      = useAuthStore((s) => s.user);
  const isSuperAdmin  = authUser?.role === "SUPER_ADMIN";
  const myCompanyId   = authUser?.companyId ?? "";

  // ── data ──────────────────────────────────────────────────────────────────
  const { data: planInfo }  = usePlanInfo(!isSuperAdmin);
  const { data: companies } = useAllCompanies(isSuperAdmin);
  const { data: roles = [] } = useRoles();

  const { data, isLoading } = useEmployees({
    page,
    limit: 15,
    role:      role      || undefined,
    companyId: companyId || undefined,
  });

  const employees = data?.data ?? [];
  const meta      = data?.meta;

  // ── mutations ─────────────────────────────────────────────────────────────
  const createUser  = useCreateUser();
  const updateUser  = useUpdateUser();
  const deleteUser  = useDeleteUser();
  const revoke      = useRevokeAccess();
  const restore     = useRestoreAccess();

  // ── helpers ───────────────────────────────────────────────────────────────
  const selectedCompanyName = companies?.find((c) => c.id === companyId)?.name;
  const colCount = isSuperAdmin ? 6 : 5;

  // ── submit handlers ───────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleCreate(data: any) {
    setFormError(null);
    try {
      await createUser.mutateAsync({
        name:      data.name,
        email:     data.email,
        password:  data.password,
        roleId:    data.roleId,
        companyId: isSuperAdmin ? data.companyId : myCompanyId,
      });
      setCreateOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Something went wrong"));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleEdit(data: any) {
    if (!editTarget) return;
    setFormError(null);
    try {
      await updateUser.mutateAsync({
        id: editTarget.id,
        payload: {
          name:   data.name,
          roleId: data.roleId,
          status: data.status,
        },
      });
      setEditTarget(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Something went wrong"));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // stays open so user can retry
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <TopBar title="People" />
      <main className="flex-1 p-6 space-y-5 page-enter overflow-auto">

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Company selector — SUPER_ADMIN only */}
            {isSuperAdmin && companies && companies.length > 0 && (
              <div className="relative">
                <Building2
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  value={companyId}
                  onChange={(e) => { setCompanyId(e.target.value); setPage(1); }}
                  className="pl-8 pr-8 py-2 rounded-xl text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 appearance-none cursor-pointer transition-all"
                >
                  <option value="">All companies</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Role tabs */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-white"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              {ROLE_TABS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setRole(value); setPage(1); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={
                    role === value
                      ? { background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff" }
                      : { color: "#64748b" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Add member button */}
          <button
            onClick={() => { setFormError(null); setCreateOpen(true); }}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
          >
            <UserPlus size={15} />
            Add member
          </button>
        </div>

        {/* ── Sub-header chips ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Driver quota chip */}
          {!isSuperAdmin && planInfo && planInfo.maxDrivers !== null && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border"
              style={{
                background: planInfo.currentDrivers >= planInfo.maxDrivers ? "#fef2f2" : "#f0fdf4",
                color:      planInfo.currentDrivers >= planInfo.maxDrivers ? "#dc2626" : "#16a34a",
                borderColor:planInfo.currentDrivers >= planInfo.maxDrivers ? "#fecaca" : "#bbf7d0",
              }}
            >
              <Users size={12} />
              {planInfo.currentDrivers} / {planInfo.maxDrivers} drivers
              {planInfo.currentDrivers >= planInfo.maxDrivers && " · Limit reached"}
            </div>
          )}

          {/* Selected company chip */}
          {isSuperAdmin && selectedCompanyName && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100">
              <Building2 size={12} />
              {selectedCompanyName}
            </div>
          )}
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #f8fafc" }}>
                  {[
                    "Member",
                    "Email",
                    ...(isSuperAdmin ? ["Company"] : []),
                    "Role",
                    "Joined",
                    "Status",
                    "", // actions column
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
                    <td colSpan={colCount + 1} className="px-5 py-12 text-center">
                      <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={colCount + 1} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50">
                          <Users size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400">
                          {isSuperAdmin && !companyId
                            ? "Select a company to view its team, or clear the filter to see all."
                            : "No team members found"}
                        </p>
                        {!isSuperAdmin && (
                          <button
                            onClick={() => { setFormError(null); setCreateOpen(true); }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            + Add your first member
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, i) => {
                    const s = STATUS_MAP[emp.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.inactive;
                    const r = ROLE_MAP[emp.role?.name ?? ""] ?? { label: emp.role?.name ?? "—", bg: "#f1f5f9", color: "#64748b" };
                    const companyName = companies?.find((c) => c.id === emp.companyId)?.name;
                    const isInactive = emp.status === "inactive";

                    return (
                      <tr
                        key={emp.id}
                        className="group hover:bg-slate-50/60 transition-colors"
                        style={{ borderBottom: i < employees.length - 1 ? "1px solid #f8fafc" : "none" }}
                      >
                        {/* Avatar + Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{
                                background: isInactive
                                  ? "#cbd5e1"
                                  : "linear-gradient(135deg,#2563eb,#7c3aed)",
                                opacity: isInactive ? 0.7 : 1,
                              }}
                            >
                              {emp.name?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">
                              {emp.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3.5 text-sm text-slate-500">
                          {emp.email}
                        </td>

                        {/* Company — SUPER_ADMIN */}
                        {isSuperAdmin && (
                          <td className="px-5 py-3.5">
                            {companyName ? (
                              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                {companyName}
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-slate-300">
                                {emp.companyId?.slice(0, 8)}…
                              </span>
                            )}
                          </td>
                        )}

                        {/* Role badge */}
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: r.bg, color: r.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                            {r.label}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {safeFormat(emp.createdAt, "MMM d, yyyy")}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: s.bg, color: s.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.dot }} />
                            {s.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Edit */}
                            <button
                              onClick={() => {
                                setFormError(null);
                                setEditTarget({
                                  id:        emp.id,
                                  name:      emp.name,
                                  email:     emp.email,
                                  roleId:    emp.roleId,
                                  status:    (emp.status as "active" | "inactive") ?? "active",
                                  companyId: emp.companyId,
                                });
                              }}
                              title="Edit member"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            >
                              <Pencil size={14} />
                            </button>

                            {/* Revoke / Restore */}
                            {isInactive ? (
                              <button
                                onClick={() => restore.mutate(emp.id)}
                                title="Restore access"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                disabled={restore.isPending}
                              >
                                {restore.isPending ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <ShieldCheck size={14} />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => revoke.mutate(emp.id)}
                                title="Revoke access"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                disabled={revoke.isPending}
                              >
                                {revoke.isPending ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <ShieldOff size={14} />
                                )}
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget({ id: emp.id, name: emp.name, email: emp.email })}
                              title="Delete user"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {meta.total} members · page {meta.page} of {meta.totalPages}
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
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Create */}
      <UserFormModal
        open={createOpen}
        mode="create"
        roles={roles}
        companies={companies}
        isSuperAdmin={isSuperAdmin}
        defaultCompanyId={myCompanyId}
        isSubmitting={createUser.isPending}
        error={formError}
        onSubmit={handleCreate}
        onClose={() => { setCreateOpen(false); setFormError(null); }}
      />

      {/* Edit */}
      <UserFormModal
        open={!!editTarget}
        mode="edit"
        initialData={editTarget ?? undefined}
        roles={roles}
        isSuperAdmin={isSuperAdmin}
        defaultCompanyId={myCompanyId}
        isSubmitting={updateUser.isPending}
        error={formError}
        onSubmit={handleEdit}
        onClose={() => { setEditTarget(null); setFormError(null); }}
      />

      {/* Delete */}
      <DeleteUserModal
        open={!!deleteTarget}
        userName={deleteTarget?.name ?? ""}
        userEmail={deleteTarget?.email ?? ""}
        isDeleting={deleteUser.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
