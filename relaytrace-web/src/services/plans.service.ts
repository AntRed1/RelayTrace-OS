import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  Plan,
  PublicPlan,
  CreatePlanPayload,
  UpdatePlanPayload,
} from "@/types";

/** Base URL used by the public fetch (Server Component / ISR). */
export const PLANS_API_URL = `${
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"
}/plans`;

// ─── Service ─────────────────────────────────────────────────────────────────

export const plansService = {
  // ── Public (landing page) ──────────────────────────────────────────────────

  /** Fetches active plans. Used by the Server Component with ISR. */
  async getPublic(): Promise<PublicPlan[]> {
    const res = await fetch(PLANS_API_URL, {
      next: { revalidate: 300 }, // ISR — revalidate every 5 min in background
    });
    if (!res.ok) throw new Error(`Failed to fetch plans: ${res.status}`);
    const json = (await res.json()) as ApiResponse<PublicPlan[]>;
    return json.data;
  },

  // ── Admin (React Query — fresh, authenticated) ─────────────────────────────

  async getAll(): Promise<Plan[]> {
    const { data } = await apiClient.get<ApiResponse<Plan[]>>("/plans/admin");
    return data.data;
  },

  async getById(id: string): Promise<Plan> {
    const { data } = await apiClient.get<ApiResponse<Plan>>(`/plans/admin/${id}`);
    return data.data;
  },

  async create(payload: CreatePlanPayload): Promise<Plan> {
    const { data } = await apiClient.post<ApiResponse<Plan>>("/plans", payload);
    return data.data;
  },

  async update(id: string, payload: UpdatePlanPayload): Promise<Plan> {
    const { data } = await apiClient.patch<ApiResponse<Plan>>(`/plans/${id}`, payload);
    return data.data;
  },

  /** Soft-deletes (deactivates) a plan. */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/plans/${id}`);
  },
};
