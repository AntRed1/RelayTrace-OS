import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plansService } from "@/services/plans.service";
import { CreatePlanPayload, UpdatePlanPayload } from "@/types";

const QUERY_KEY = "plans";

// ─── Admin reads ──────────────────────────────────────────────────────────────

export function usePlans() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn:  plansService.getAll,
    staleTime: 0, // admin always sees fresh data
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => plansService.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePlanPayload }) =>
      plansService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRemovePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansService.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
