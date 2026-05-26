import { useQuery } from "@tanstack/react-query";
import { reconciliationService } from "@/services/reconciliation.service";

export function useReconciliation(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["reconciliation", page, limit],
    queryFn: () => reconciliationService.getAll(page, limit),
  });
}

export function useReconciliationSummary() {
  return useQuery({
    queryKey: ["reconciliation", "summary"],
    queryFn: reconciliationService.getSummary,
    refetchInterval: 30000,
  });
}
