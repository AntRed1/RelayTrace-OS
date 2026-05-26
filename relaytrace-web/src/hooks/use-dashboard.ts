import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardService.getSummary,
    refetchInterval: 30000, // refresh cada 30s
  });
}

export function useDashboardActivity(limit = 10) {
  return useQuery({
    queryKey: ["dashboard", "activity", limit],
    queryFn: () => dashboardService.getActivity(limit),
    refetchInterval: 30000,
  });
}
