"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTrip } from "@/hooks/use-trips";
import { CheckCircle2, Loader2, Upload, Truck } from "lucide-react";

const schema = z.object({
  tripId: z
    .string()
    .min(3, "Trip ID required")
    .regex(/^T-\d+$/i, "Format: T-XXXXXXXXX"),
  screenshotUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

export default function RegisterTripPage() {
  const { mutateAsync, isPending } = useCreateTrip();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await mutateAsync({
      tripId: data.tripId,
      screenshotUrl: data.screenshotUrl || undefined,
    });
    setSuccess(true);
    reset();
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--rt-gradient)" }}
          >
            <Truck size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Register Trip</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your Amazon Relay trip details
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-4 px-4 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Trip registered successfully
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Your trip is being processed
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div
          className="bg-white rounded-2xl p-6 border border-slate-200"
          style={{ boxShadow: "var(--rt-shadow)" }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Trip ID <span className="text-red-400">*</span>
              </label>
              <input
                {...register("tripId")}
                placeholder="T-123456789"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all font-mono"
              />
              {errors.tripId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.tripId.message}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Found in your Amazon Relay app confirmation screen
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Screenshot URL{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Upload
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  {...register("screenshotUrl")}
                  placeholder="https://..."
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                />
              </div>
              {errors.screenshotUrl && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.screenshotUrl.message}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                OCR will auto-extract Trip ID from the screenshot
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{
                background: "var(--rt-gradient)",
                boxShadow: "0 1px 3px rgb(37 99 235 / .4)",
              }}
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              {isPending ? "Registering..." : "Register Trip"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          RelayTrace OS · Driver Portal
        </p>
      </div>
    </div>
  );
}
