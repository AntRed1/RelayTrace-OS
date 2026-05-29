"use client";

import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Info } from "lucide-react";
import { Plan, CreatePlanPayload } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const planSchema = z.object({
  slug:             z.string()
                     .min(2, "Min 2 characters")
                     .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  displayName:      z.string().min(2, "Min 2 characters"),
  description:      z.string().min(5, "Min 5 characters"),
  priceMonthly:     z.coerce.number().min(0, "Must be ≥ 0"),
  currency:         z.string().length(3, "3-letter currency code (e.g. USD)"),
  unlimitedDrivers: z.boolean(),
  maxDriversInput:  z.coerce.number().int().positive("Must be a positive integer").optional()
                     .or(z.literal("").transform(() => undefined)),
  featureLabels:    z.string().min(1, "Add at least one label"),
  featureFlags:     z.string(),
  ctaLabel:         z.string().min(1, "Required"),
  isPopular:        z.boolean(),
  isActive:         z.boolean(),
  sortOrder:        z.coerce.number().int(),
});

type FormData = z.infer<typeof planSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function arrToLines(arr: string[]): string {
  return arr.join("\n");
}

function linesToArr(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function buildDefaultValues(plan?: Plan): FormData {
  return {
    slug:             plan?.slug             ?? "",
    displayName:      plan?.displayName      ?? "",
    description:      plan?.description      ?? "",
    priceMonthly:     plan?.priceMonthly     ?? 0,
    currency:         plan?.currency         ?? "USD",
    unlimitedDrivers: plan ? plan.maxDrivers === null : false,
    maxDriversInput:  plan?.maxDrivers       ?? (undefined as unknown as number),
    featureLabels:    arrToLines(plan?.featureLabels ?? []),
    featureFlags:     arrToLines(plan?.featureFlags  ?? []),
    ctaLabel:         plan?.ctaLabel         ?? "Get Started",
    isPopular:        plan?.isPopular        ?? false,
    isActive:         plan?.isActive         ?? true,
    sortOrder:        plan?.sortOrder        ?? 0,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open:         boolean;
  mode:         "create" | "edit";
  initialData?: Plan;
  isSubmitting: boolean;
  error?:       string | null;
  onSubmit:     (payload: CreatePlanPayload) => void;
  onClose:      () => void;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <Info size={10} />
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  accent = "#2563eb",
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-6 rounded-full transition-all duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        style={{ background: checked ? accent : "#cbd5e1" }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

function inputClass(extra = "") {
  return `w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${extra}`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function PlanFormModal({
  open,
  mode,
  initialData,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: Props) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    // Cast needed: z.coerce fields produce `unknown` input types that confuse the
    // Resolver generic; the runtime behaviour is correct — coerce always yields numbers.
    resolver:      zodResolver(planSchema) as Resolver<FormData>,
    defaultValues: buildDefaultValues(initialData),
  });

  const unlimitedDrivers = useWatch({ control, name: "unlimitedDrivers" });
  const isPopular        = useWatch({ control, name: "isPopular" });
  const isActive         = useWatch({ control, name: "isActive" });

  // Re-populate form when modal opens with different data
  useEffect(() => {
    if (open) reset(buildDefaultValues(initialData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData?.id]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  function handleFormSubmit(data: FormData) {
    const payload: CreatePlanPayload = {
      slug:          data.slug,
      displayName:   data.displayName,
      description:   data.description,
      priceMonthly:  data.priceMonthly,
      currency:      data.currency.toUpperCase(),
      maxDrivers:    data.unlimitedDrivers ? null : (data.maxDriversInput ?? null),
      featureLabels: linesToArr(data.featureLabels),
      featureFlags:  linesToArr(data.featureFlags),
      ctaLabel:      data.ctaLabel,
      isPopular:     data.isPopular,
      isActive:      data.isActive,
      sortOrder:     data.sortOrder,
    };
    onSubmit(payload);
  }

  const title    = isEdit ? `Edit "${initialData?.displayName}"` : "Create plan";
  const subtitle = isEdit
    ? "Update plan details. A price change will create a new Stripe Price automatically."
    : "New plans are provisioned in Stripe automatically.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        {/* Accent bar */}
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

        {/* Form body */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="px-6 py-5 max-h-[78vh] overflow-y-auto space-y-4"
        >

          {/* ── Identity ─────────────────────────────────────────────────── */}
          <SectionLabel>Identity</SectionLabel>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug" error={errors.slug?.message} hint="e.g. starter · cannot change after creation">
              <input
                {...register("slug")}
                placeholder="starter"
                disabled={isEdit}
                className={inputClass(isEdit ? "opacity-50 cursor-not-allowed" : "")}
              />
            </Field>
            <Field label="Sort order" error={errors.sortOrder?.message} hint="Lower = shown first">
              <input
                {...register("sortOrder")}
                type="number"
                min={0}
                className={inputClass()}
              />
            </Field>
          </div>

          <Field label="Display name" error={errors.displayName?.message}>
            <input
              {...register("displayName")}
              placeholder="Starter"
              className={inputClass()}
            />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <input
              {...register("description")}
              placeholder="Perfect for small fleets getting started"
              className={inputClass()}
            />
          </Field>

          {/* ── Pricing ──────────────────────────────────────────────────── */}
          <SectionLabel>Pricing</SectionLabel>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Monthly price" error={errors.priceMonthly?.message} hint="Set to 0 for a Contact Us plan">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                    $
                  </span>
                  <input
                    {...register("priceMonthly")}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="49.00"
                    className={inputClass("pl-7")}
                  />
                </div>
              </Field>
            </div>
            <Field label="Currency" error={errors.currency?.message}>
              <input
                {...register("currency")}
                placeholder="USD"
                maxLength={3}
                className={inputClass("uppercase")}
              />
            </Field>
          </div>

          <div className="space-y-2">
            <Toggle
              label="Unlimited drivers"
              description="No cap on the number of drivers"
              checked={!!unlimitedDrivers}
              onChange={(v) => setValue("unlimitedDrivers", v, { shouldValidate: true })}
              accent="#16a34a"
            />
            {!unlimitedDrivers && (
              <Field label="Max drivers" error={errors.maxDriversInput?.message}>
                <input
                  {...register("maxDriversInput")}
                  type="number"
                  min={1}
                  placeholder="20"
                  className={inputClass()}
                />
              </Field>
            )}
          </div>

          <Field label="CTA button label" error={errors.ctaLabel?.message}>
            <input
              {...register("ctaLabel")}
              placeholder="Get Started"
              className={inputClass()}
            />
          </Field>

          {/* ── Features ─────────────────────────────────────────────────── */}
          <SectionLabel>Features</SectionLabel>

          <Field
            label="Feature labels"
            error={errors.featureLabels?.message}
            hint="One label per line — displayed as bullet points on the pricing card"
          >
            <textarea
              {...register("featureLabels")}
              rows={4}
              placeholder={"Real-time tracking\nOCR receipt processing\nUp to 5 drivers"}
              className={inputClass("resize-none leading-relaxed")}
            />
          </Field>

          <Field
            label="Feature flags"
            error={errors.featureFlags?.message}
            hint="One flag per line — internal guard keys used by PlanGuard (e.g. OCR_PROCESSING)"
          >
            <textarea
              {...register("featureFlags")}
              rows={3}
              placeholder={"TRIP_REGISTRATION\nOCR_PROCESSING\nRECONCILIATION"}
              className={inputClass("resize-none font-mono text-xs leading-relaxed")}
            />
          </Field>

          {/* ── Visibility ───────────────────────────────────────────────── */}
          <SectionLabel>Visibility</SectionLabel>

          <Toggle
            label="Most popular"
            description="Highlights this plan with a badge on the pricing page"
            checked={!!isPopular}
            onChange={(v) => setValue("isPopular", v, { shouldValidate: true })}
            accent="#2563eb"
          />

          <Toggle
            label="Active"
            description="Inactive plans are hidden from the public pricing page"
            checked={!!isActive}
            onChange={(v) => setValue("isActive", v, { shouldValidate: true })}
            accent="#16a34a"
          />

          {/* ── Error ────────────────────────────────────────────────────── */}
          {error && (
            <div className="px-3.5 py-3 rounded-xl text-xs text-red-600 bg-red-50 border border-red-100">
              {error}
            </div>
          )}

          {/* ── Submit row ───────────────────────────────────────────────── */}
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
                boxShadow:  "0 0 16px rgba(37,99,235,0.3)",
              }}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
