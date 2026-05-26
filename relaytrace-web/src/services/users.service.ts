import apiClient from "@/lib/api-client";
import { ApiResponse, PaginatedResponse, Driver } from "@/types";

export type EmployeeRole = "DRIVER" | "DISPATCHER" | "COMPANY_ADMIN";

export const usersService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    companyId?: string;
    role?: EmployeeRole | "";
  }): Promise<PaginatedResponse<Driver>> {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<Driver>>
    >("/users", { params });
    return data.data;
  },
};
