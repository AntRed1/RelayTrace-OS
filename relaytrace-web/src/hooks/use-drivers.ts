import { useQuery } from "@tanstack/react-query";
import { driversService } from "@/services/drivers.service";

export function useDrivers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["drivers", page, limit],
    queryFn: () => driversService.getAll(page, limit),
  });
}

export function useDriverStats(driverId: string) {
  return useQuery({
    queryKey: ["drivers", driverId, "stats"],
    queryFn: () => driversService.getStats(driverId),
    enabled: !!driverId,
  });
}
