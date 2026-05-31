import apiClient from "@/lib/api-client";
import { ApiResponse, DashboardSummary, DashboardActivity, DashboardAlert, MapPoint } from "@/types";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } =
      await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
    return data.data;
  },

  async getActivity(limit = 10): Promise<DashboardActivity> {
    const { data } = await apiClient.get<ApiResponse<DashboardActivity>>(
      "/dashboard/activity",
      { params: { limit } },
    );
    return data.data;
  },

  async getAlerts(limit = 20): Promise<DashboardAlert[]> {
    const { data } = await apiClient.get<ApiResponse<DashboardAlert[]>>(
      "/dashboard/alerts",
      { params: { limit } },
    );
    return data.data;
  },

  async getMapPoints(limit = 50): Promise<MapPoint[]> {
    const { data } = await apiClient.get<ApiResponse<MapPoint[]>>(
      "/dashboard/map-points",
      { params: { limit } },
    );
    return data.data;
  },
};
