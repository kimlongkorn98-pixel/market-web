// Client-side permission helpers. These only decide what to SHOW; the
// backend checks every request and is the source of truth.

import type { AuthUser } from "./api";

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  editor: "Editor",
  user: "User",
};

// Mirrors ROLE_RANK in backend/config/permissions.py.
const ROLE_RANK: Record<string, number> = {
  super_admin: 3,
  admin: 2,
  editor: 1,
  user: 0,
};

export function roleRank(role?: string): number {
  return ROLE_RANK[role ?? ""] ?? 0;
}

export function roleLabel(role?: string): string {
  return ROLE_LABELS[role ?? ""] ?? role ?? "User";
}

export function hasPermission(user: AuthUser | null | undefined, code: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.permissions?.includes(code) ?? false;
}

/** Can `actor` manage an account / hand out a role at `role`? (same rule as the API) */
export function outranks(actor: AuthUser | null | undefined, role?: string): boolean {
  if (!actor) return false;
  return actor.role === "super_admin" || roleRank(role) < roleRank(actor.role);
}

/** Permissions that unlock the admin area. */
export const ADMIN_AREA_PERMISSIONS = ["users:read", "roles:read", "audit:read"];
