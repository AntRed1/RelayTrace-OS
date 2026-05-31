import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsService } from "@/services/trips.service";
import { CreateTripPayload } from "@/types";

export const TRIPS_KEY = "trips";

export function useMyTrips(page = 1, limit = 20) {
  return useQuery({
    queryKey: [TRIPS_KEY, "me", page, limit],
    queryFn: () => tripsService.getMyTrips(page, limit),
  });
}

export function useAllTrips(params?: {
  page?: number;
  limit?: number;
  status?: string;
  driverId?: string;
  companyId?: string;
  tripId?: string;
}) {
  return useQuery({
    queryKey: [TRIPS_KEY, "all", params],
    queryFn: () => tripsService.getAll(params),
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTripPayload) => tripsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_KEY] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_KEY] });
    },
  });
}
