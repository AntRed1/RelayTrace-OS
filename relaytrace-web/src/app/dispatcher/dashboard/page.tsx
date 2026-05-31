"use client";

import { TopBar } from "@/components/layouts/TopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTripsTable } from "@/components/dashboard/RecentTripsTable";
import {
  useDashboardSummary,
  useDashboardActivity,
} from "@/hooks/use-dashboard";
import { Loader2 } from "lucide-react";

export default function DispatcherDashboardPage() {
  const { data: summary, isLoading: ls } = useDashboardSummary();
  const { data: activity, isLoading: la } = useDashboardActivity(8);

  return (
    <>
      <TopBar title="Dispatcher Dashboard" />
      <main className="flex-1 p-6 space-y-5 page-enter">
        {ls ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 size={15} className="animate-spin" /> Loading...
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Trips Today"
              value={summary?.tripsToday ?? 0}
              badge="Active"
              badgeColor="green"
            />
            <StatCard
              label="Active Drivers"
              value={summary?.activeDrivers ?? 0}
              badge="On route"
              badgeColor="blue"
            />
            <StatCard
              label="Total Trips"
              value={summary?.totalTrips ?? 0}
              badge="All time"
              badgeColor="blue"
            />
            <StatCard
              label="Alerts"
              value={summary?.pendingAlerts ?? 0}
              badge={summary?.pendingAlerts ? "Pending" : "Clear"}
              badgeColor={summary?.pendingAlerts ? "amber" : "green"}
            />
          </div>
        )}
        {la ? (
          <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center py-12"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Loader2 size={18} className="animate-spin text-blue-400" />
          </div>
        ) : (
          <RecentTripsTable trips={activity?.recentTrips ?? []} />
        )}
      </main>
    </>
  );
}
