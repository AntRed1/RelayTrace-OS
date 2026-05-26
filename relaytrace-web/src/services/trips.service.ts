import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  PaginatedResponse,
  Trip,
  CreateTripPayload,
} from "@/types";

export const tripsService = {
  async create(payload: CreateTripPayload): Promise<Trip> {
    const { data } = await apiClient.post<ApiResponse<Trip>>("/trips", payload);
    return data.data;
  },

  async getMyTrips(page = 1, limit = 20): Promise<PaginatedResponse<Trip>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Trip>>>(
      "/trips/me",
      { params: { page, limit } },
    );
    return data.data;
  },

  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    driverId?: string;
  }): Promise<PaginatedResponse<Trip>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Trip>>>(
      "/trips",
      { params },
    );
    return data.data;
  },

  async getById(id: string): Promise<Trip> {
    const { data } = await apiClient.get<ApiResponse<Trip>>(`/trips/${id}`);
    return data.data;
  },

  async updateStatus(id: string, status: string): Promise<Trip> {
    const { data } = await apiClient.patch<ApiResponse<Trip>>(`/trips/${id}`, {
      status,
    });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/trips/${id}`);
  },
};
