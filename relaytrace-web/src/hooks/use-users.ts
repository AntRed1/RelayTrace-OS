import { useQuery } from "@tanstack/react-query";
import { usersService, EmployeeRole } from "@/services/users.service";

export const USERS_KEY = "users";

export function useEmployees(params?: {
  page?: number;
  limit?: number;
  companyId?: string;
  role?: EmployeeRole | "";
}) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => usersService.getAll(params),
  });
}
