"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface Props {
  open:        boolean;
  userName:    string;
  userEmail:   string;
  isDeleting:  boolean;
  onConfirm:   () => void;
  onClose:     () => void;
}

export function DeleteUserModal({
  open,
  userName,
  userEmail,
  isDeleting,
  onConfirm,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}
      >
        {/* Red top bar */}
        <div className="h-1 w-full bg-red-500" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Delete user?</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              You are about to permanently delete{" "}
              <span className="font-semibold text-slate-700">{userName}</span>{" "}
              <span className="text-slate-400 text-xs">({userEmail})</span>.
              This action cannot be undone. All their trip history will remain
              but they will lose all access immediately.
            </p>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60"
            >
              {isDeleting && <Loader2 size={13} className="animate-spin" />}
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
