"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";

export default function OnboardingCancelPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header accent */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg,#64748b,#94a3b8)" }}
        />

        <div className="px-8 py-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-slate-100">
            <XCircle size={32} className="text-slate-400" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Payment cancelled
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              No worries — your card was not charged. You can return to the
              pricing page and try again whenever you're ready.
            </p>
          </div>

          {/* FAQ-style reassurance */}
          <div
            className="rounded-2xl p-4 border text-left space-y-3"
            style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-start gap-2.5">
              <HelpCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Was I charged?
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  No. Stripe only charges once you complete the payment flow.
                  Cancelling before that means you owe nothing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <HelpCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Can I choose a different plan?
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Yes — go back to the pricing section and select the plan
                  that works best for you.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/#pricing"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
            >
              View Plans Again
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <ArrowLeft size={14} /> Back to Homepage
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Need help?{" "}
            <a
              href="mailto:support@relaytrace.net"
              className="text-blue-500 hover:text-blue-600"
            >
              support@relaytrace.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
