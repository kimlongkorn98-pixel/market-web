"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock, Search, Trash2, UserPlus, X } from "lucide-react";
import {
  approveUser,
  assignRole,
  deleteUser,
  rejectUser,
  listRoles,
  listUsers,
  updateUser,
  type AuthUser,
} from "@/lib/api";
import { useAuthStore, useCan } from "@/lib/auth-store";
import { outranks, ROLE_LABELS, roleLabel } from "@/lib/permissions";
import { ErrorBanner, errorMessage, RoleBadge, Spinner } from "./shared";
import CreateUserForm from "./CreateUserForm";

type Filter = "all" | "pending";

export default function UsersTab() {
  const token = useAuthStore((s) => s.accessToken)!;
  const me = useAuthStore((s) => s.user);
  const can = useCan();

  const [users, setUsers] = useState<AuthUser[] | null>(null);
  const [roleNames, setRoleNames] = useState<string[]>(Object.keys(ROLE_LABELS));
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(
    async (q?: string, f: Filter = "all") => {
      setError(null);
      try {
        setUsers(
          await listUsers(token, { q, approvalStatus: f === "pending" ? "pending" : undefined })
        );
      } catch (e) {
        setError(errorMessage(e));
        setUsers([]);
      }
    },
    [token]
  );

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setUsers(null);
    load(query, f);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (can("roles:read")) {
      listRoles(token)
        .then((roles) => setRoleNames(roles.map((r) => r.name)))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, token]);

  /** Run an API action for one row and swap in the updated user. */
  const act = async (id: number, action: () => Promise<AuthUser | null>) => {
    setError(null);
    setBusyId(id);
    try {
      const updated = await action();
      setUsers((list) =>
        updated
          ? (list ?? []).map((u) => (u.id === id ? updated : u))
          : (list ?? []).filter((u) => u.id !== id)
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  // Roles this admin may hand out (same rank rule the API enforces).
  const assignable = roleNames.filter((r) => outranks(me, r));
  const pendingCount =
    filter === "pending"
      ? users?.length ?? 0
      : (users ?? []).filter((u) => u.approval_status === "pending").length;

  return (
    <section>
      {/* Toolbar: search, filter, create */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(query, filter);
          }}
          className="flex min-w-60 flex-1 max-w-md items-center gap-2 rounded-xl border border-gray-200 bg-white px-3"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            aria-label="Search users"
            className="flex-1 bg-transparent py-2.5 text-sm outline-none text-gray-800"
          />
        </form>

        <div className="flex rounded-xl border border-gray-200 bg-white p-1 text-sm" role="group" aria-label="Filter users">
          {(["all", "pending"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              aria-pressed={filter === f}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filter === f ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "All users" : "Pending approval"}
              {f === "pending" && pendingCount > 0 && (
                <span className={`rounded-full px-1.5 text-xs ${filter === f ? "bg-white/25" : "bg-amber-100 text-amber-700"}`}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {can("users:create") && !showCreate && (
          <button
            onClick={() => {
              setShowCreate(true);
              setNotice(null);
            }}
            className="ml-auto flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <UserPlus className="w-4 h-4" />
            Create account
          </button>
        )}
      </div>

      {/* Super admins: a nudge when requests are waiting */}
      {can("users:approve") && filter === "all" && pendingCount > 0 && (
        <button
          onClick={() => changeFilter("pending")}
          className="mb-4 flex w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800 hover:bg-amber-100"
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span className="flex-1">
            <strong>{pendingCount}</strong> account{pendingCount === 1 ? " is" : "s are"} waiting for your approval.
          </span>
          <span className="font-semibold underline">Review</span>
        </button>
      )}

      {showCreate && (
        <CreateUserForm
          roleNames={roleNames}
          onClose={() => setShowCreate(false)}
          onCreated={(user) => {
            setShowCreate(false);
            setUsers((list) => [...(list ?? []), user]);
            setNotice(
              user.approval_status === "pending"
                ? `${user.email} was created and is waiting for super admin approval.`
                : `${user.email} was created and can sign in now.`
            );
          }}
        />
      )}

      {notice && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-sm text-green-700">
          <Check className="w-4 h-4" /> {notice}
        </p>
      )}

      <ErrorBanner message={error} />

      {users === null ? (
        <Spinner />
      ) : users.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          {filter === "pending" ? "No accounts are waiting for approval." : "No users found."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === me?.id;
                const manageable = !isMe && outranks(me, u.role);
                const busy = busyId === u.id;
                return (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {u.name} {isMe && <span className="text-xs text-gray-400">(you)</span>}
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {can("roles:assign") && manageable ? (
                        <select
                          value={u.role}
                          disabled={busy}
                          aria-label={`Role for ${u.name}`}
                          onChange={(e) => {
                            const role = e.target.value;
                            if (window.confirm(`Change ${u.name}'s role to ${roleLabel(role)}?`)) {
                              act(u.id, () => assignRole(token, u.id, role));
                            }
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm"
                        >
                          {[...new Set([u.role ?? "user", ...assignable])].map((r) => (
                            <option key={r} value={r} disabled={!assignable.includes(r)}>
                              {roleLabel(r)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <RoleBadge role={u.role} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge user={u} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {can("users:approve") && manageable && u.approval_status !== "approved" && (
                          <>
                            <button
                              disabled={busy}
                              onClick={() => act(u.id, () => approveUser(token, u.id))}
                              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            {u.approval_status === "pending" && (
                              <button
                                disabled={busy}
                                onClick={() => {
                                  if (window.confirm(`Reject the account request for ${u.email}?`)) {
                                    act(u.id, () => rejectUser(token, u.id));
                                  }
                                }}
                                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            )}
                          </>
                        )}
                        {can("users:update") && manageable && u.approval_status !== "pending" && u.approval_status !== "rejected" && (
                          <button
                            disabled={busy}
                            onClick={() =>
                              act(u.id, () => updateUser(token, u.id, { is_active: !u.is_active }))
                            }
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
                          >
                            {u.is_active ? "Disable" : "Enable"}
                          </button>
                        )}
                        {can("users:delete") && manageable && (
                          <button
                            disabled={busy}
                            aria-label={`Delete ${u.name}`}
                            onClick={() => {
                              if (window.confirm(`Delete ${u.name} (${u.email})? This can't be undone.`)) {
                                act(u.id, () => deleteUser(token, u.id).then(() => null));
                              }
                            }}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ user }: { user: AuthUser }) {
  if (user.approval_status === "pending") {
    return (
      <div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          <Clock className="w-3 h-3" /> Pending approval
        </span>
        {user.created_by_email && (
          <div className="mt-1 text-xs text-gray-400">by {user.created_by_email}</div>
        )}
      </div>
    );
  }
  if (user.approval_status === "rejected") {
    return (
      <span className="inline-block rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
        Rejected
      </span>
    );
  }
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      {user.is_active ? "Active" : "Disabled"}
    </span>
  );
}
