"use client";

import { TopBar } from "@/components/layouts/TopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTripsTable } from "@/components/dashboard/RecentTripsTable";
import {
  useDashboardSummary,
  useDashboardActivity,
} from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: activity, isLoading: loadingActivity } =
    useDashboardActivity(8);

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* KPI Cards */}
        {loadingSummary ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 size={15} className="animate-spin" /> Loading metrics...
          </div>
        ) : (
          <>
            {isSuperAdmin && (
              <p className="text-xs text-slate-400 -mb-1">
                Showing global metrics across all companies
              </p>
            )}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label={isSuperAdmin ? "Trips Today" : "Active Trips"}
                value={summary?.tripsToday ?? 0}
                badge="Active"
                badgeColor="green"
              />
              <StatCard
                label="Active Drivers"
                value={summary?.activeDrivers ?? 0}
                badge="Current"
                badgeColor="blue"
              />
              <StatCard
                label="Total Trips"
                value={summary?.totalTrips ?? 0}
                badge="All time"
                badgeColor="blue"
              />
              <StatCard
                label="Pending Alerts"
                value={summary?.pendingAlerts ?? 0}
                badge={summary?.pendingAlerts ? "Review" : "Clear"}
                badgeColor={summary?.pendingAlerts ? "amber" : "green"}
              />
            </div>
          </>
        )}

        {/* Recent Trips */}
        {loadingActivity ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={15} className="animate-spin" /> Loading activity...
          </div>
        ) : (
          <RecentTripsTable
            trips={activity?.recentTrips ?? []}
            isSuperAdmin={isSuperAdmin}
          />
        )}
      </main>
    </>
  );
}
