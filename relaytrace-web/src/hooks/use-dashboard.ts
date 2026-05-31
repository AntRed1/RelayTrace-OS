import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardService.getSummary,
    refetchInterval: 30000,
  });
}

export function useDashboardActivity(limit = 10) {
  return useQuery({
    queryKey: ["dashboard", "activity", limit],
    queryFn: () => dashboardService.getActivity(limit),
    refetchInterval: 30000,
  });
}

export function useDashboardAlerts(limit = 20) {
  return useQuery({
    queryKey: ["dashboard", "alerts", limit],
    queryFn: () => dashboardService.getAlerts(limit),
    refetchInterval: 30000,
  });
}

export function useMapPoints(limit = 50) {
  return useQuery({
    queryKey: ["dashboard", "map-points", limit],
    queryFn: () => dashboardService.getMapPoints(limit),
    refetchInterval: 60000,
  });
}
