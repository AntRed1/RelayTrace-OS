import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/config/constants";

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value};path=/;max-age=${days * 86400};SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;path=/;max-age=0`;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, accessToken: string, refreshToken?: string) => void;
  clearSession: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setSession: (user, accessToken, refreshToken) => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        setCookie("rt_token", accessToken);
        setCookie("rt_role", user.role);
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        });
      },

      clearSession: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        deleteCookie("rt_token");
        deleteCookie("rt_role");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: USER_KEY,
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
