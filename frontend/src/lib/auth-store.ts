"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ApiError,
  getMe,
  login as apiLogin,
  register as apiRegister,
  type AuthUser,
} from "./api";
import { hasPermission } from "./permissions";

interface AuthStore {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  /** Returns null on success, or an error message string on failure. */
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  /** Re-fetch the user (role/permissions may have changed server-side). */
  refresh: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const result = await apiLogin({ email, password });
          set({
            accessToken: result.accessToken,
            user: result.user,
            isAuthenticated: true,
          });
          return null;
        } catch (e) {
          return e instanceof ApiError ? e.message : "Something went wrong.";
        }
      },

      register: async (name, email, password) => {
        try {
          const result = await apiRegister({ name, email, password });
          set({
            accessToken: result.accessToken,
            user: result.user,
            isAuthenticated: true,
          });
          return null;
        } catch (e) {
          return e instanceof ApiError ? e.message : "Something went wrong.";
        }
      },

      refresh: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          set({ user: await getMe(token) });
        } catch (e) {
          // Expired token or disabled account: sign out. Network errors keep
          // the cached user so the site still works while the API is down.
          if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
            get().signOut();
          }
        }
      },

      setUser: (user) => set({ user }),

      signOut: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    { name: "market-auth" }
  )
);

/** `can("users:read")` for the signed-in user (UI only; the API enforces). */
export function useCan() {
  const user = useAuthStore((s) => s.user);
  return (code: string) => hasPermission(user, code);
}
