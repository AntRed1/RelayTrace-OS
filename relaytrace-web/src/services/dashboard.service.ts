import apiClient from "@/lib/api-client";
import { ApiResponse, DashboardSummary, DashboardActivity } from "@/types";

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
};
