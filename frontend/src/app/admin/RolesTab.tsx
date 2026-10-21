"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import {
  listPermissions,
  listRoles,
  setRolePermissions,
  type PermissionInfo,
  type RoleInfo,
} from "@/lib/api";
import { useAuthStore, useCan } from "@/lib/auth-store";
import { hasPermission, outranks } from "@/lib/permissions";
import { ErrorBanner, errorMessage, RoleBadge, Spinner } from "./shared";

/** Copy of `record` without `key` (drops a role's unsaved draft). */
function without<T>(record: Record<string, T>, key: string): Record<string, T> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

export default function RolesTab() {
  const token = useAuthStore((s) => s.accessToken)!;
  const me = useAuthStore((s) => s.user);
  const can = useCan();

  const [roles, setRoles] = useState<RoleInfo[] | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionInfo[]>([]);
  // Unsaved checkbox state, per role name.
  const [drafts, setDrafts] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listRoles(token), listPermissions(token)])
      .then(([r, p]) => {
        setRoles(r);
        setAllPermissions(p);
      })
      .catch((e) => {
        setError(errorMessage(e));
        setRoles([]);
      });
  }, [token]);

  const toggle = (role: RoleInfo, code: string) => {
    const current = drafts[role.name] ?? role.permissions;
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
    setDrafts((d) => ({ ...d, [role.name]: next }));
    setSaved(null);
  };

  const save = async (role: RoleInfo) => {
    setError(null);
    setSaving(role.name);
    try {
      const updated = await setRolePermissions(token, role.name, drafts[role.name] ?? role.permissions);
      setRoles((list) => (list ?? []).map((r) => (r.name === updated.name ? updated : r)));
      setDrafts((d) => without(d, role.name));
      setSaved(role.name);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(null);
    }
  };

  if (roles === null) return <Spinner />;

  return (
    <section>
      <ErrorBanner message={error} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSuper = role.name === "super_admin";
          // Same rules as the API: super_admin is locked, and nobody but a
          // super admin edits their own role level or higher.
          const editable = can("roles:manage") && !isSuper && outranks(me, role.name);
          const draft = drafts[role.name];
          const selected = isSuper ? allPermissions.map((p) => p.code) : draft ?? role.permissions;
          const dirty =
            draft !== undefined &&
            [...draft].sort().join() !== [...role.permissions].sort().join();

          return (
            <div key={role.name} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <RoleBadge role={role.name} />
                {saved === role.name && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
              <p className="mb-4 text-sm text-gray-500">
                {isSuper ? "Always has every permission (locked)." : role.description}
              </p>

              <ul className="space-y-1.5">
                {allPermissions.map((perm) => {
                  // Non-super admins can't grant what they don't hold.
                  const grantable = me?.role === "super_admin" || hasPermission(me, perm.code);
                  return (
                    <li key={perm.code}>
                      <label
                        className={`flex items-start gap-2.5 text-sm ${
                          editable && grantable ? "cursor-pointer" : "cursor-default opacity-70"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-indigo-600"
                          checked={selected.includes(perm.code)}
                          disabled={!editable || !grantable || saving === role.name}
                          onChange={() => toggle(role, perm.code)}
                        />
                        <span>
                          <code className="text-xs font-semibold text-gray-800">{perm.code}</code>
                          {perm.description && (
                            <span className="block text-xs text-gray-500">{perm.description}</span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              {editable && (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    disabled={!dirty || saving === role.name}
                    onClick={() => setDrafts((d) => without(d, role.name))}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Reset
                  </button>
                  <button
                    disabled={!dirty || saving === role.name}
                    onClick={() => save(role)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                  >
                    {saving === role.name ? "Saving…" : "Save changes"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
