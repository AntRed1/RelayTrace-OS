import apiClient from "@/lib/api-client";
import { ApiResponse, LoginResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload,
    );
    return data.data;
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh",
      { refreshToken },
    );
    return data.data;
  },
};
