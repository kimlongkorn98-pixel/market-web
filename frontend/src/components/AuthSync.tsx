"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Keeps the cached user (role + permissions) in sync with the server: on
 * load and on every navigation. A role change made by an admin therefore
 * shows up without signing out, and a disabled account is signed out.
 */
export default function AuthSync() {
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const refresh = useAuthStore((s) => s.refresh);

  useEffect(() => {
    if (accessToken) refresh();
  }, [accessToken, pathname, refresh]);

  return null;
}
