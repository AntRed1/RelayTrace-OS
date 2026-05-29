import { useQuery }           from "@tanstack/react-query";
import { auditService, AuditQueryParams } from "@/services/audit.service";

export function useAuditLogs(params: AuditQueryParams) {
  return useQuery({
    queryKey:  ["audit", params],
    queryFn:   () => auditService.getLogs(params),
    staleTime: 30_000, // 30 s — audit data changes frequently
  });
}
