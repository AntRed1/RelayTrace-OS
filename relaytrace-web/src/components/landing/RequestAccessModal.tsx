"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  companyName:  z.string().min(2, "Company name is required"),
  contactName:  z.string().min(2, "Contact name is required"),
  email:        z.string().email("Valid email required"),
  phone:        z.string().optional(),
  driverCount:  z.number().int().min(1).max(9999).optional(),
  notes:        z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RequestAccessModal({ open, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    await apiClient.post("/companies/request", data);
    setSubmitted(true);
    reset();
  };

  const handleClose = () => {
    setSubmitted(false);
    reset();
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}
      >
        {/* Header */}
        <div
          className="px-7 py-5 flex items-center justify-between border-b border-slate-100"
          style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)" }}
        >
          <div>
            <h2 className="text-base font-bold text-white">Request Access</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Our team will activate your account within 24 hours
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {submitted ? (
            /* Success state */
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Request received!
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                We'll review your information and activate your account within
                24 hours. Check your inbox for a confirmation.
              </p>
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                Close
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Company name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("companyName")}
                    placeholder="Transportes del Norte LLC"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Contact name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("contactName")}
                    placeholder="Juan Pérez"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                  />
                  {errors.contactName && (
                    <p className="text-xs text-red-500 mt-1">{errors.contactName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Business Email <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Phone <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+1 555 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                  />
                </div>

                {/* Driver count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    # of Drivers <span className="text-slate-400 font-normal">(approx.)</span>
                  </label>
                  <input
                    {...register("driverCount", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : parseInt(v, 10) })}
                    type="number"
                    min={1}
                    placeholder="12"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tell us about your operation{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="We have 3 Relay accounts shared across 15 drivers..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                {isSubmitting ? "Sending request..." : "Submit Request"}
              </button>

              <p className="text-center text-xs text-slate-400">
                No credit card required · 14-day free trial included
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
