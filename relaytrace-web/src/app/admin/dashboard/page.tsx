"use client";

import { TopBar }            from "@/components/layouts/TopBar";
import { StatCard }          from "@/components/dashboard/StatCard";
import { RecentTripsTable }  from "@/components/dashboard/RecentTripsTable";
import { RelayPointsMap }    from "@/components/dashboard/RelayPointsMap";
import {
  useDashboardSummary,
  useDashboardActivity,
} from "@/hooks/use-dashboard";
import { useAuthStore }      from "@/stores/auth.store";
import {
  Truck,
  Users,
  ScanLine,
  AlertTriangle,
  Loader2,
  Radio,
  ChevronDown,
} from "lucide-react";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const user         = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useDashboardActivity(8);

  const trips = activity?.recentTrips ?? [];

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-5 page-enter overflow-auto">

        {/* ── Global notice for SUPER_ADMIN ───────────────────────────────── */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 w-fit">
            <Radio size={12} className="text-blue-500" />
            Showing global metrics across all companies
          </div>
        )}

        {/* ── KPI Cards ────────────────────────────────────────────────────── */}
        {loadingSummary ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
            <Loader2 size={14} className="animate-spin" /> Loading metrics…
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label={isSuperAdmin ? "Trips Today" : "Active Trips"}
              value={summary?.tripsToday ?? 0}
              badge="Active"
              badgeColor="green"
              icon={Truck}
              trend="up"
              trendValue="↑ Active"
            />
            <StatCard
              label="Active Drivers"
              value={summary?.activeDrivers ?? 0}
              badge="Current"
              badgeColor="blue"
              icon={Users}
              trend="neutral"
              trendValue="Online now"
            />
            <StatCard
              label="Total Trips"
              value={summary?.totalTrips ?? 0}
              badge="All time"
              badgeColor="purple"
              icon={ScanLine}
            />
            <StatCard
              label="Pending Alerts"
              value={summary?.pendingAlerts ?? 0}
              badge={summary?.pendingAlerts ? "Review" : "Clear"}
              badgeColor={summary?.pendingAlerts ? "amber" : "green"}
              icon={AlertTriangle}
              trend={summary?.pendingAlerts ? "down" : "up"}
              trendValue={summary?.pendingAlerts ? "Needs review" : "All clear"}
            />
          </div>
        )}

        {/* ── Map + Recent Trips (2-column layout) ─────────────────────────── */}
        <div className="grid xl:grid-cols-[1fr_380px] gap-5" style={{ minHeight: "420px" }}>

          {/* Map card */}
          <div
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            {/* Map header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                />
                <h2 className="text-sm font-bold text-slate-800">Relay Points</h2>
              </div>
              <button className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Real time
                <ChevronDown size={12} />
              </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative" style={{ minHeight: "340px" }}>
              <RelayPointsMap />
            </div>
          </div>

          {/* Recent Trips panel */}
          {loadingActivity ? (
            <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
                <Loader2 size={18} className="animate-spin text-blue-400" />
                Loading trips…
              </div>
            </div>
          ) : (
            <RecentTripsTable
              trips={trips}
              isSuperAdmin={isSuperAdmin}
            />
          )}
        </div>

      </main>
    </>
  );
}
