import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  usersService,
  EmployeeRole,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/services/users.service";

export const USERS_KEY = "users";
export const ROLES_KEY = "roles";

// ─── Queries ─────────────────────────────────────────────────────────────────

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

export function useEmployee(id: string, enabled = true) {
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: () => usersService.getById(id),
    enabled: enabled && !!id,
  });
}

/** Available roles — used to populate role dropdowns */
export function useRoles() {
  return useQuery({
    queryKey: [ROLES_KEY],
    queryFn: () => usersService.getRoles(),
    staleTime: 10 * 60 * 1000, // roles rarely change
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}

export function useRevokeAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.revokeAccess(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}

export function useRestoreAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.restoreAccess(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersService.changePassword(id, newPassword),
  });
}
