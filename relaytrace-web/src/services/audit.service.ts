import apiClient         from "@/lib/api-client";
import { ApiResponse, AuditLogEntry, PaginatedResponse } from "@/types";

export interface AuditQueryParams {
  page?:      number;
  limit?:     number;
  action?:    string;
  userId?:    string;
  /** SUPER_ADMIN only — omit to get all companies */
  companyId?: string;
  from?:      string; // ISO date string
  to?:        string; // ISO date string
}

export const auditService = {
  async getLogs(
    params: AuditQueryParams,
  ): Promise<PaginatedResponse<AuditLogEntry>> {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<AuditLogEntry>>
    >("/audit", { params });
    return data.data;
  },
};
