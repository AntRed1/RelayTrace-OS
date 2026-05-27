import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/types";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface PreRegistrationCheckoutDto {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  driverCount?: number;
  plan: "starter" | "growth" | "fleet";
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionStatus {
  status: "complete" | "expired" | "open" | string;
  customerEmail?: string;
  companyName?: string;
  plan?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const billingService = {
  /**
   * Creates a Stripe Checkout session for a new (not yet registered) company.
   * Returns the Stripe Checkout URL to redirect the user to.
   */
  async createCheckout(
    dto: PreRegistrationCheckoutDto,
  ): Promise<{ url: string }> {
    const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
      "/billing/checkout",
      dto,
    );
    return data.data;
  },

  /**
   * Retrieves the status of a completed Checkout session.
   * Used by the success page to confirm payment and show company details.
   */
  async getSessionStatus(sessionId: string): Promise<CheckoutSessionStatus> {
    const { data } = await apiClient.get<ApiResponse<CheckoutSessionStatus>>(
      `/billing/session/${sessionId}/status`,
    );
    return data.data;
  },
};
