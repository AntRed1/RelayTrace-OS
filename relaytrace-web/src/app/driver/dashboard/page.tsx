"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMyTrips } from "@/hooks/use-trips";
import { format } from "date-fns";
import { Loader2, Truck, Plus } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/constants";

const statusMap: Record<string, { bg: string; color: string; label: string }> =
  {
    confirmed: { bg: "#f0fdf4", color: "#16a34a", label: "Confirmed" },
    pending: { bg: "#fffbeb", color: "#d97706", label: "Pending" },
    flagged: { bg: "#fef2f2", color: "#dc2626", label: "Flagged" },
  };

export default function DriverDashboardPage() {
  const { user, logout } = useAuth();
  const { data, isLoading } = useMyTrips(1, 10);
  const trips = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--rt-gradient)" }}
          >
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-slate-900">
            Relay<span className="text-blue-600">Trace</span>
          </span>
        </div>
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
          <p className="text-sm text-slate-500 mt-0.5">
            Here are your recent trips
          </p>
        </div>

        {/* CTA */}
        <Link
          href={ROUTES.DRIVER.REGISTER_TRIP}
          className="flex items-center gap-3 p-4 rounded-2xl text-white transition-all"
          style={{
            background: "var(--rt-gradient)",
            boxShadow: "0 4px 12px rgb(37 99 235 / .3)",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Register New Trip</p>
            <p className="text-xs text-white/80 mt-0.5">
              Tap to add your Amazon Relay trip
            </p>
          </div>
        </Link>

        {/* Trips */}
        <div
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{ boxShadow: "var(--rt-shadow-sm)" }}
        >
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">My Trips</h2>
          </div>

          {isLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 size={20} className="animate-spin text-blue-500" />
            </div>
          ) : trips.length === 0 ? (
            <div className="py-10 text-center">
              <Truck size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No trips registered yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {trips.map((trip) => {
                const s = statusMap[trip.status] ?? statusMap.pending;
                return (
                  <div
                    key={trip.id}
                    className="px-5 py-3.5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 font-mono">
                        {trip.tripId}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(trip.registeredAt), "MMM d · h:mm a")}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: s.bg, color: s.color }}
                    >
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
