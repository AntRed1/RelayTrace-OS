"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth }    from "@/hooks/use-auth";
import { useMyTrips } from "@/hooks/use-trips";
import { safeFormat } from "@/lib/utils";
import { Loader2, Truck, Plus, ScanLine, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { ROUTES } from "@/config/constants";
import { OcrStatus } from "@/types";

const STATUS_MAP: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  confirmed: { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", label: "Confirmed" },
  pending:   { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b", label: "In Transit" },
  flagged:   { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", label: "Flagged"   },
};

const OCR_MAP: Record<OcrStatus, { color: string; label: string; pulse?: boolean } | null> = {
  none:       null,
  pending:    { color: "#d97706", label: "OCR queued", pulse: true },
  processing: { color: "#2563eb", label: "Reading…",   pulse: true },
  completed:  { color: "#16a34a", label: "OCR done"               },
  failed:     { color: "#dc2626", label: "OCR failed"             },
};

const PAGE_SIZE = 10;

export default function DriverDashboardPage() {
  const { user, logout } = useAuth();
  const [page, setPage]  = useState(1);

  const { data, isLoading } = useMyTrips(page, PAGE_SIZE);
  const trips = data?.data ?? [];
  const meta  = data?.meta;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <Image
          src="/images/logo-main.png"
          alt="RelayTrace OS"
          width={140}
          height={36}
          style={{ width: "auto", height: "36px" }}
          priority
        />
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.DRIVER.SETTINGS}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            aria-label="Settings"
          >
            <Settings size={17} />
          </Link>
          <button
            onClick={logout}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Welcome */}
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Hello, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here are your trips</p>
        </div>

        {/* Register CTA */}
        <Link
          href={ROUTES.DRIVER.REGISTER_TRIP}
          className="flex items-center gap-3 p-4 rounded-2xl text-white transition-all hover:opacity-90 active:scale-[0.99]"
          style={{
            background: "linear-gradient(135deg,#22d3ee,#2563eb)",
            boxShadow: "0 4px 16px rgb(37 99 235 / .35)",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Plus size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">Register New Trip</p>
            <p className="text-xs text-white/75 mt-0.5">Tap to add your Amazon Relay trip</p>
          </div>
        </Link>

        {/* Trips list */}
        <div
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">My Trips</h2>
            {meta && (
              <span className="text-xs text-slate-400">{meta.total} total</span>
            )}
          </div>

          {isLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 size={20} className="animate-spin text-blue-400" />
            </div>
          ) : trips.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Truck size={28} className="text-slate-200 mx-auto" />
              <p className="text-sm text-slate-400">No trips registered yet</p>
              <Link
                href={ROUTES.DRIVER.REGISTER_TRIP}
                className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Register your first trip →
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {trips.map((trip) => {
                  const s   = STATUS_MAP[trip.status] ?? STATUS_MAP.pending;
                  const ocr = OCR_MAP[trip.ocrStatus ?? "none"];
                  return (
                    <div
                      key={trip.id}
                      className="px-5 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 font-mono tracking-tight">
                          {trip.tripId}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {safeFormat(trip.registeredAt, "MMM d · h:mm a")}
                        </p>
                        {ocr && (
                          <span
                            className="inline-flex items-center gap-1 text-xs mt-1"
                            style={{ color: ocr.color }}
                          >
                            {ocr.pulse
                              ? <Loader2 size={10} className="animate-spin" />
                              : <ScanLine size={10} />
                            }
                            {ocr.label}
                          </span>
                        )}
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: s.bg, color: s.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Page {meta.page} of {meta.totalPages}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-all"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      disabled={page === meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-all"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
