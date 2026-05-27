"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Eye, EyeOff, RefreshCw, Loader2, ShieldCheck } from "lucide-react";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    newPassword:     z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  ].sort(() => Math.random() - 0.5).join("");
}

function strengthLabel(pw: string): { label: string; color: string; width: string } {
  if (pw.length < 6)  return { label: "Too short",  color: "#ef4444", width: "25%"  };
  if (pw.length < 10) return { label: "Weak",        color: "#f59e0b", width: "50%"  };
  if (pw.length < 14) return { label: "Good",        color: "#22c55e", width: "75%"  };
  return               { label: "Strong",      color: "#10b981", width: "100%" };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open:        boolean;
  userName:    string;
  userEmail:   string;
  isSubmitting:boolean;
  error?:      string | null;
  onSubmit:    (newPassword: string) => void;
  onClose:     () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChangePasswordModal({
  open,
  userName,
  userEmail,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: Props) {
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const newPassword = watch("newPassword", "");
  const strength    = strengthLabel(newPassword);

  useEffect(() => {
    if (!open) {
      reset();
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  function handleGenerate() {
    const pwd = generatePassword();
    setValue("newPassword",     pwd, { shouldValidate: true });
    setValue("confirmPassword", pwd, { shouldValidate: true });
    setShowNew(true);
    setShowConfirm(true);
  }

  function onFormSubmit(data: FormData) {
    onSubmit(data.newPassword);
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        {/* Gradient top bar */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg,#22d3ee,#2563eb,#818cf8)" }}
        />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50">
              <ShieldCheck size={17} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Change password</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {userName}{" "}
                <span className="text-slate-300">·</span>{" "}
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-5 space-y-4">

          {/* New password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              New password
            </label>
            <div className="relative">
              <input
                {...register("newPassword")}
                type={showNew ? "text" : "password"}
                placeholder="Min 8 characters"
                className={inputCls}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  title="Auto-generate strong password"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                >
                  {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
            )}

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: strength.width, background: strength.color }}
                  />
                </div>
                <p className="text-[11px] font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Confirm password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              >
                {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="px-3.5 py-3 rounded-xl text-xs text-red-600 bg-red-50 border border-red-100">
              {error}
            </div>
          )}

          <p className="text-[11px] text-slate-400 pt-1">
            🔒 This action is recorded in the audit log. The user will need to sign in again with their new password.
          </p>

          <div className="flex gap-2.5 pt-1">
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
              {isSubmitting ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
