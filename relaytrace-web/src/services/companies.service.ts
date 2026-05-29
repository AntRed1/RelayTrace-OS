import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  Company,
  CompanyRequest,
  CompanyRequestStatus,
  PlanInfo,
} from "@/types";
// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface ProcessRequestDto {
  status: "approved" | "rejected";
  notes?: string;
}

export interface OnboardCompanyDto {
  adminEmail:        string;
  adminName:         string;
  temporaryPassword: string;
  plan?:             string; // any plan slug from the DB
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const companiesService = {
  // ── Company listings ───────────────────────────────────────

  async getAll(): Promise<Company[]> {
    const { data } = await apiClient.get<ApiResponse<Company[]>>("/companies");
    return data.data;
  },

  async getMyCompany(): Promise<Company> {
    const { data } = await apiClient.get<ApiResponse<Company>>("/companies/me");
    return data.data;
  },

  async getMyPlanInfo(): Promise<PlanInfo> {
    const { data } = await apiClient.get<ApiResponse<PlanInfo>>("/companies/me/plan");
    return data.data;
  },

  async updateCompanyPlan(companyId: string, plan: string): Promise<PlanInfo> {
    const { data } = await apiClient.patch<ApiResponse<PlanInfo>>(
      `/companies/${companyId}/plan`,
      { plan },
    );
    return data.data;
  },

  // ── Company access requests (SUPER_ADMIN) ──────────────────

  async getRequests(status?: CompanyRequestStatus): Promise<CompanyRequest[]> {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<ApiResponse<CompanyRequest[]>>(
      "/companies/requests",
      { params },
    );
    return data.data;
  },

  async processRequest(
    id: string,
    dto: ProcessRequestDto,
  ): Promise<CompanyRequest> {
    const { data } = await apiClient.patch<ApiResponse<CompanyRequest>>(
      `/companies/requests/${id}/status`,
      dto,
    );
    return data.data;
  },

  async onboardCompany(
    id: string,
    dto: OnboardCompanyDto,
  ): Promise<{ company: Company; admin: { id: string; email: string; name: string } }> {
    const { data } = await apiClient.post<
      ApiResponse<{ company: Company; admin: { id: string; email: string; name: string } }>
    >(`/companies/requests/${id}/onboard`, dto);
    return data.data;
  },
};
