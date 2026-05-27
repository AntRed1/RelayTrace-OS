"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth }      from "@/hooks/use-auth";
import { useMyTrips }   from "@/hooks/use-trips";
import { safeFormat }   from "@/lib/utils";
import { Loader2, Truck, Plus } from "lucide-react";
import { ROUTES } from "@/config/constants";

const STATUS_MAP: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  confirmed: { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", label: "Confirmed" },
  pending:   { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b", label: "In Transit" },
  flagged:   { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", label: "Flagged"   },
};

export default function DriverDashboardPage() {
  const { user, logout } = useAuth();
  const { data, isLoading } = useMyTrips(1, 10);
  const trips = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <Image
          src="/images/logo-horizontal.png"
          alt="RelayTrace OS"
          width={140}
          height={36}
          style={{ width: "auto", height: "32px" }}
          priority
        />
        <button
          onClick={logout}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Welcome */}
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Hello, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here are your recent trips</p>
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
            <span className="text-xs text-slate-400">{trips.length} recent</span>
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
            <div className="divide-y divide-slate-50">
              {trips.map((trip) => {
                const s = STATUS_MAP[trip.status] ?? STATUS_MAP.pending;
                return (
                  <div
                    key={trip.id}
                    className="px-5 py-3.5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 font-mono tracking-tight">
                        {trip.tripId}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {/* safeFormat guards against null / invalid dates */}
                        {safeFormat(trip.registeredAt, "MMM d · h:mm a")}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: s.bg, color: s.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
