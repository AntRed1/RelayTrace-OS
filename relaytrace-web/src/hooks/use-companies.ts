import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  companiesService,
  OnboardCompanyDto,
  ProcessRequestDto,
} from "@/services/companies.service";
import { CompanyRequestStatus } from "@/types";
import { PlanName } from "@/config/plan.config";

export const PLAN_INFO_KEY = "plan-info";

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const COMPANIES_KEY = "companies";
export const REQUESTS_KEY = "company-requests";

// ─── Queries ─────────────────────────────────────────────────────────────────

/** All companies — only for SUPER_ADMIN. Pass enabled=false for other roles. */
export function useAllCompanies(enabled = true) {
  return useQuery({
    queryKey: [COMPANIES_KEY, "all"],
    queryFn: () => companiesService.getAll(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyCompany() {
  return useQuery({
    queryKey: [COMPANIES_KEY, "me"],
    queryFn: () => companiesService.getMyCompany(),
  });
}

/** Plan info for the authenticated company. Pass enabled=false for SUPER_ADMIN (no companyId). */
export function usePlanInfo(enabled = true) {
  return useQuery({
    queryKey: [PLAN_INFO_KEY],
    queryFn: () => companiesService.getMyPlanInfo(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, plan }: { companyId: string; plan: PlanName }) =>
      companiesService.updateCompanyPlan(companyId, plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLAN_INFO_KEY] });
      qc.invalidateQueries({ queryKey: [COMPANIES_KEY] });
    },
  });
}

/** Company access requests — only for SUPER_ADMIN. */
export function useCompanyRequests(
  status?: CompanyRequestStatus,
  enabled = true,
) {
  return useQuery({
    queryKey: [REQUESTS_KEY, status ?? "all"],
    queryFn: () => companiesService.getRequests(status),
    enabled,
    staleTime: 60 * 1000, // 1 min — requests change frequently
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Approve or reject a request without onboarding. */
export function useProcessRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ProcessRequestDto }) =>
      companiesService.processRequest(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REQUESTS_KEY] });
    },
  });
}

/** Full onboarding: creates Company + COMPANY_ADMIN and marks request approved. */
export function useOnboardCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: OnboardCompanyDto }) =>
      companiesService.onboardCompany(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REQUESTS_KEY] });
      qc.invalidateQueries({ queryKey: [COMPANIES_KEY] });
    },
  });
}
