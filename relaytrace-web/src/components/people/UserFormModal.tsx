"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import { RoleItem } from "@/services/users.service";
import { Company } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalMode = "create" | "edit";

const createSchema = z.object({
  name:      z.string().min(2, "Min 2 characters"),
  email:     z.string().email("Invalid email"),
  password:  z.string().min(8, "Min 8 characters"),
  roleId:    z.string().min(1, "Select a role"),
  companyId: z.string().min(1, "Select a company"),
});

const editSchema = z.object({
  name:   z.string().min(2, "Min 2 characters"),
  roleId: z.string().min(1, "Select a role"),
  status: z.enum(["active", "inactive"]),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData   = z.infer<typeof editSchema>;

// ─── Role display config ──────────────────────────────────────────────────────

const ROLE_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  DRIVER:        { label: "Driver",        color: "#2563eb", bg: "#eff6ff" },
  DISPATCHER:    { label: "Dispatcher",    color: "#7c3aed", bg: "#f5f3ff" },
  COMPANY_ADMIN: { label: "Company Admin", color: "#0891b2", bg: "#ecfeff" },
  SUPER_ADMIN:   { label: "Super Admin",   color: "#d97706", bg: "#fffbeb" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generatePassword(): string {
  const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const special = "!@#$%&*";
  const all     = upper + lower + digits + special;
  const rand    = (s: string) => s[Math.floor(Math.random() * s.length)];
  return [
    rand(upper), rand(lower), rand(digits), rand(special),
    ...Array.from({ length: 8 }, () => rand(all)),
  ]
    .sort(() => Math.random() - 0.5)
    .join("");
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface UserFormInitialData {
  id: string;
  name: string;
  roleId: string;
  status: "active" | "inactive";
  companyId: string;
  email: string;
}

interface Props {
  open:          boolean;
  mode:          ModalMode;
  initialData?:  UserFormInitialData;
  roles:         RoleItem[];
  companies?:    Pick<Company, "id" | "name">[];
  isSuperAdmin:  boolean;
  defaultCompanyId?: string;          // pre-set for COMPANY_ADMIN
  isSubmitting:  boolean;
  error?:        string | null;
  onSubmit:      (data: CreateFormData | EditFormData) => void;
  onClose:       () => void;
}

// ─── Create Form ──────────────────────────────────────────────────────────────

function CreateForm({
  roles,
  companies,
  isSuperAdmin,
  defaultCompanyId,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: Omit<Props, "open" | "mode" | "initialData">) {
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      companyId: isSuperAdmin ? "" : (defaultCompanyId ?? ""),
    },
  });

  const password = watch("password", "");

  function handleGenerate() {
    const pwd = generatePassword();
    setValue("password", pwd, { shouldValidate: true });
    setShowPass(true);
  }

  // Roles available per actor
  const availableRoles = isSuperAdmin
    ? roles.filter((r) => r.name !== "SUPER_ADMIN")
    : roles.filter((r) => r.name === "DRIVER" || r.name === "DISPATCHER");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
      {/* Name */}
      <Field label="Full name" error={errors.name?.message}>
        <input
          {...register("name")}
          placeholder="Juan García"
          className={input()}
        />
      </Field>

      {/* Email */}
      <Field label="Email" error={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          placeholder="driver@company.com"
          className={input()}
        />
      </Field>

      {/* Password */}
      <Field label="Temporary password" error={errors.password?.message}>
        <div className="relative">
          <input
            {...register("password")}
            type={showPass ? "text" : "password"}
            placeholder="Min 8 characters"
            className={input("pr-20")}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleGenerate}
              title="Auto-generate"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
            >
              <RefreshCw size={13} />
            </button>
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
            >
              {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
        {password.length >= 8 && (
          <p className="text-xs text-emerald-500 mt-1">
            ✓ Strong enough — remind the user to change it on first login
          </p>
        )}
      </Field>

      {/* Role */}
      <Field label="Role" error={errors.roleId?.message}>
        <select {...register("roleId")} className={input()}>
          <option value="">Select role…</option>
          {availableRoles.map((r) => {
            const d = ROLE_DISPLAY[r.name];
            return (
              <option key={r.id} value={r.id}>
                {d?.label ?? r.name}
              </option>
            );
          })}
        </select>
      </Field>

      {/* Company — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <Field label="Company" error={errors.companyId?.message}>
          <select {...register("companyId")} className={input()}>
            <option value="">Select company…</option>
            {(companies ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {error && (
        <div className="px-3.5 py-3 rounded-xl text-xs text-red-600 bg-red-50 border border-red-100">
          {error}
        </div>
      )}

      <SubmitRow isSubmitting={isSubmitting} onClose={onClose} label="Create user" />
    </form>
  );
}

// ─── Edit Form ────────────────────────────────────────────────────────────────

function EditForm({
  initialData,
  roles,
  isSuperAdmin,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: Omit<Props, "open" | "mode" | "companies" | "defaultCompanyId"> & { initialData: UserFormInitialData }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name:   initialData.name,
      roleId: initialData.roleId,
      status: initialData.status,
    },
  });

  const availableRoles = isSuperAdmin
    ? roles.filter((r) => r.name !== "SUPER_ADMIN")
    : roles.filter((r) => r.name === "DRIVER" || r.name === "DISPATCHER");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
      {/* Email (read-only) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Email
        </label>
        <input
          value={initialData.email}
          disabled
          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
        />
      </div>

      {/* Name */}
      <Field label="Full name" error={errors.name?.message}>
        <input {...register("name")} className={input()} />
      </Field>

      {/* Role */}
      <Field label="Role" error={errors.roleId?.message}>
        <select {...register("roleId")} className={input()}>
          {availableRoles.map((r) => {
            const d = ROLE_DISPLAY[r.name];
            return (
              <option key={r.id} value={r.id}>
                {d?.label ?? r.name}
              </option>
            );
          })}
        </select>
      </Field>

      {/* Status */}
      <Field label="Status" error={errors.status?.message}>
        <select {...register("status")} className={input()}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>

      {error && (
        <div className="px-3.5 py-3 rounded-xl text-xs text-red-600 bg-red-50 border border-red-100">
          {error}
        </div>
      )}

      <SubmitRow isSubmitting={isSubmitting} onClose={onClose} label="Save changes" />
    </form>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SubmitRow({
  isSubmitting,
  onClose,
  label,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  label: string;
}) {
  return (
    <div className="flex gap-2.5 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg,#22d3ee,#2563eb)",
          boxShadow: "0 0 16px rgba(37,99,235,0.3)",
        }}
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? "Saving…" : label}
      </button>
    </div>
  );
}

function input(extra = "") {
  return `w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${extra}`;
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

export function UserFormModal(props: Props) {
  const { open, mode, initialData, onClose } = props;

  // Trap focus / close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const title = mode === "create" ? "Add team member" : "Edit member";
  const subtitle =
    mode === "create"
      ? "Create a new user and assign them to a role."
      : `Editing ${initialData?.name ?? "user"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        {/* Gradient top bar */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg,#22d3ee,#2563eb,#818cf8)" }}
        />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          {mode === "create" ? (
            <CreateForm {...props} />
          ) : initialData ? (
            <EditForm {...props} initialData={initialData} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
