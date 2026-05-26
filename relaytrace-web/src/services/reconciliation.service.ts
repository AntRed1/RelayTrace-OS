import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  PaginatedResponse,
  Reconciliation,
  ReconciliationSummary,
} from "@/types";

export const reconciliationService = {
  async getAll(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Reconciliation>> {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<Reconciliation>>
    >("/reconciliation", { params: { page, limit } });
    return data.data;
  },

  async getSummary(): Promise<ReconciliationSummary> {
    const { data } = await apiClient.get<ApiResponse<ReconciliationSummary>>(
      "/reconciliation/summary",
    );
    return data.data;
  },
};
