import apiClient from "@/lib/api-client";
import { ApiResponse, PaginatedResponse, Driver, DriverStats } from "@/types";

export const driversService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<Driver>> {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<Driver>>
    >("/drivers", { params: { page, limit } });
    return data.data;
  },

  async getStats(driverId: string): Promise<DriverStats> {
    const { data } = await apiClient.get<ApiResponse<DriverStats>>(
      `/drivers/${driverId}/stats`,
    );
    return data.data;
  },
};
