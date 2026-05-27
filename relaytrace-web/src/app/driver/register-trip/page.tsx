"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTrip } from "@/hooks/use-trips";
import { uploadsService } from "@/services/uploads.service";
import {
  CheckCircle2,
  Loader2,
  Camera,
  ImagePlus,
  X,
  Truck,
} from "lucide-react";

// ─── Schema (no URL field — file is managed separately) ──────────────────────

const schema = z.object({
  tripId: z
    .string()
    .min(3, "Trip ID required")
    .regex(/^T-\d+$/i, "Format: T-XXXXXXXXX"),
});
type FormData = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterTripPage() {
  const { mutateAsync, isPending } = useCreateTrip();

  // ── File state ──────────────────────────────────────────────────────────────
  const fileInputRef               = useRef<HTMLInputElement>(null);
  const [file, setFile]            = useState<File | null>(null);
  const [preview, setPreview]      = useState<string | null>(null);
  const [uploading, setUploading]  = useState(false);
  const [uploadPct, setUploadPct]  = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // ── File picker ─────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) return;

    // Validate size client-side (10 MB)
    if (picked.size > 10 * 1024 * 1024) {
      setUploadError("Image must be smaller than 10 MB");
      return;
    }

    setFile(picked);
    setUploadError(null);
    setUploadPct(0);

    // Generate local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(picked);
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    setUploadPct(0);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    let screenshotUrl: string | undefined;

    // Upload image first if one is selected
    if (file) {
      try {
        setUploading(true);
        setUploadError(null);
        const result = await uploadsService.uploadScreenshot(file, setUploadPct);
        screenshotUrl = uploadsService.toFullUrl(result.url);
      } catch {
        setUploadError("Upload failed. Please try again.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    await mutateAsync({ tripId: data.tripId, screenshotUrl });
    setSuccess(true);
    reset();
    removeFile();
    setTimeout(() => setSuccess(false), 4000);
  };

  const busy = isPending || uploading;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Header ─────────────────────────────────────────────────────── */}
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

        {/* ── Success banner ─────────────────────────────────────────────── */}
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

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl p-6 border border-slate-200"
          style={{ boxShadow: "var(--rt-shadow)" }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Trip ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Trip ID <span className="text-red-400">*</span>
              </label>
              <input
                {...register("tripId")}
                placeholder="T-123456789"
                autoCapitalize="characters"
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

            {/* Screenshot upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Trip Screenshot{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>

              {/* Hidden native file input — capture="environment" opens camera on mobile */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload trip screenshot"
              />

              {preview ? (
                /* ── Preview card ─────────────────────────────────────── */
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Trip screenshot preview"
                    className="w-full object-contain max-h-52"
                    style={{ background: "#f8fafc" }}
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/60 flex items-center justify-center hover:bg-slate-900/80 transition-colors"
                    aria-label="Remove screenshot"
                  >
                    <X size={13} className="text-white" />
                  </button>

                  {/* Upload progress overlay */}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                      <Loader2 size={22} className="animate-spin text-blue-500" />
                      <p className="text-xs font-semibold text-blue-600">
                        Uploading… {uploadPct}%
                      </p>
                      {/* Progress bar */}
                      <div className="w-2/3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${uploadPct}%`,
                            background: "linear-gradient(90deg,#22d3ee,#2563eb)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* File name footer */}
                  {!uploading && (
                    <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate max-w-[70%]">
                        {file?.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Upload button ────────────────────────────────────── */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-3 py-7 rounded-2xl border-2 border-dashed transition-all duration-200 active:scale-[0.98]"
                  style={{
                    borderColor: "#cbd5e1",
                    background: "#f8fafc",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#2563eb";
                    (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1";
                    (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}
                  >
                    <Camera size={22} className="text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Take photo or upload
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tap to open camera · max 10 MB
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ImagePlus size={12} />
                    <span>JPEG, PNG or WebP</span>
                  </div>
                </button>
              )}

              {/* Upload error */}
              {uploadError && (
                <p className="text-xs text-red-500 mt-1.5">{uploadError}</p>
              )}

              <p className="text-xs text-slate-400 mt-1.5">
                OCR will auto-extract Trip ID from the screenshot
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "var(--rt-gradient)",
                boxShadow: "0 1px 3px rgb(37 99 235 / .4)",
              }}
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              {uploading
                ? "Uploading photo…"
                : isPending
                ? "Registering…"
                : "Register Trip"}
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
