"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams }               from "next/navigation";
import Link                              from "next/link";
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  Mail,
  AlertCircle,
} from "lucide-react";
import { billingService, CheckoutSessionStatus } from "@/services/billing.service";

// ─── Plan display ─────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth:  "Growth",
  fleet:   "Fleet",
};

// ─── Inner component (needs Suspense for useSearchParams) ─────────────────────

function OnboardingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get("session_id");

  const [status, setStatus]   = useState<CheckoutSessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found. Please contact support.");
      setLoading(false);
      return;
    }

    billingService
      .getSessionStatus(sessionId)
      .then((s) => setStatus(s))
      .catch(() => setError("Could not verify payment. Please contact support."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header accent */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg,#22d3ee,#2563eb)" }}
        />

        <div className="px-8 py-10">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 size={36} className="animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-sm text-slate-500">Verifying your payment…</p>
            </div>

          ) : error ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
              <p className="text-sm text-slate-500">{error}</p>
              <a
                href="mailto:support@relaytrace.net"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Mail size={14} /> support@relaytrace.net
              </a>
            </div>

          ) : status?.status === "complete" ? (
            <>
              {/* Success state */}
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
                >
                  <CheckCircle2 size={32} color="#fff" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                  Payment confirmed! 🎉
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Your{" "}
                  <span className="font-semibold text-blue-600">
                    {PLAN_LABELS[status.plan ?? ""] ?? status.plan}
                  </span>{" "}
                  account for{" "}
                  <span className="font-semibold text-slate-700">
                    {status.companyName}
                  </span>{" "}
                  is being set up now.
                </p>
              </div>

              {/* Info box */}
              <div
                className="rounded-2xl p-5 border mb-6 space-y-3"
                style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
              >
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Check your inbox
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      We sent your login credentials and a payment receipt to{" "}
                      <span className="font-medium text-slate-700">
                        {status.customerEmail}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  ⚠️{" "}
                  <span className="font-semibold text-amber-700">
                    Change your temporary password
                  </span>{" "}
                  on first login for security.
                </div>
              </div>

              {/* Next steps */}
              <div className="space-y-2.5 mb-7">
                {[
                  "Check email for your credentials",
                  "Log in to the admin portal",
                  "Invite your drivers and dispatchers",
                  "Start registering trips",
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "#eff6ff", color: "#2563eb" }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-600">{step}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                Go to Login <ArrowRight size={15} />
              </Link>
            </>

          ) : (
            // Expired or unexpected status
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                <AlertCircle size={28} className="text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Session {status?.status ?? "unknown"}
              </h2>
              <p className="text-sm text-slate-500">
                Your checkout session may have expired. If you completed payment,
                please check your email. Otherwise, try again.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                Back to Homepage
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page (wraps content in Suspense for useSearchParams) ─────────────────────

export default function OnboardingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}
        >
          <Loader2 size={36} className="animate-spin text-blue-400" />
        </div>
      }
    >
      <OnboardingSuccessContent />
    </Suspense>
  );
}
