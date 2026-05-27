import apiClient from "@/lib/api-client";
import { ApiResponse, PaginatedResponse, Driver } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmployeeRole = "DRIVER" | "DISPATCHER" | "COMPANY_ADMIN";

export interface RoleItem {
  id: string;
  name: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId: string;
  companyId: string;
}

export interface UpdateUserPayload {
  name?: string;
  roleId?: string;
  status?: "active" | "inactive";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const usersService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    companyId?: string;
    role?: EmployeeRole | "";
  }): Promise<PaginatedResponse<Driver>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Driver>>>(
      "/users",
      { params },
    );
    return data.data;
  },

  async getById(id: string): Promise<Driver> {
    const { data } = await apiClient.get<ApiResponse<Driver>>(`/users/${id}`);
    return data.data;
  },

  async create(payload: CreateUserPayload): Promise<Driver> {
    const { data } = await apiClient.post<ApiResponse<Driver>>("/users", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<Driver> {
    const { data } = await apiClient.patch<ApiResponse<Driver>>(
      `/users/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /** Quick revoke — sets status to inactive */
  async revokeAccess(id: string): Promise<Driver> {
    const { data } = await apiClient.patch<ApiResponse<Driver>>(
      `/users/${id}`,
      { status: "inactive" },
    );
    return data.data;
  },

  /** Restore access — sets status back to active */
  async restoreAccess(id: string): Promise<Driver> {
    const { data } = await apiClient.patch<ApiResponse<Driver>>(
      `/users/${id}`,
      { status: "active" },
    );
    return data.data;
  },

  async changePassword(id: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.patch<ApiResponse<{ message: string }>>(
      `/users/${id}/password`,
      { newPassword },
    );
    return data.data;
  },

  async getRoles(): Promise<RoleItem[]> {
    const { data } = await apiClient.get<ApiResponse<RoleItem[]>>("/roles");
    return data.data;
  },
};
