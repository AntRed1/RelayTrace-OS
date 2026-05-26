import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService, LoginPayload } from "@/services/auth.service";
import { ROLE_ROUTES, ROUTES } from "@/config/constants";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setSession, clearSession } = useAuthStore();

  async function login(payload: LoginPayload) {
    const response = await authService.login(payload);

    setSession(
      {
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role,
        companyId: response.companyId,
      },
      response.accessToken,
      response.refreshToken,
    );

    const redirectTo = ROLE_ROUTES[response.role] ?? ROUTES.AUTH.LOGIN;
    router.push(redirectTo);
  }

  function logout() {
    clearSession();
    router.push(ROUTES.AUTH.LOGIN);
  }

  return { user, isAuthenticated, login, logout };
}
