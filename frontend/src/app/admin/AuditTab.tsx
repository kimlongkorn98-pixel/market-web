"use client";

import { useEffect, useState } from "react";
import { listAuditLogs, type AuditEntry } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { roleLabel } from "@/lib/permissions";
import { ErrorBanner, errorMessage, Spinner } from "./shared";

const PAGE_SIZE = 50;

/** One readable sentence per audit entry. */
function describe(entry: AuditEntry): string {
  const d = (entry.details ?? {}) as Record<string, unknown>;
  const who = (d.email as string) ?? `user #${entry.target_id}`;
  switch (entry.action) {
    case "user.role_changed":
      return `Changed ${who}'s role from ${roleLabel(d.before as string)} to ${roleLabel(d.after as string)}`;
    case "role.permissions_changed": {
      const parts = [];
      const added = (d.added as string[]) ?? [];
      const removed = (d.removed as string[]) ?? [];
      if (added.length) parts.push(`granted ${added.join(", ")}`);
      if (removed.length) parts.push(`revoked ${removed.join(", ")}`);
      return `${roleLabel(entry.target_id)} role: ${parts.join("; ") || "no change"}`;
    }
    case "user.disabled":
      return `Disabled ${who}`;
    case "user.enabled":
      return `Enabled ${who}`;
    case "user.created":
      return `Created ${who} as ${roleLabel(d.role as string)}${
        d.approval_status === "pending" ? " (awaiting approval)" : ""
      }`;
    case "user.approved":
      return `Approved ${who}${d.created_by ? ` (requested by ${d.created_by})` : ""}`;
    case "user.rejected":
      return `Rejected ${who}${d.created_by ? ` (requested by ${d.created_by})` : ""}`;
    case "user.deleted":
      return `Deleted ${who} (${roleLabel(d.role as string)})`;
    default:
      return `${entry.action} on ${entry.target_type} ${entry.target_id}`;
  }
}

export default function AuditTab() {
  const token = useAuthStore((s) => s.accessToken)!;
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAuditLogs(token, 0, PAGE_SIZE)
      .then((page) => {
        setEntries(page);
        setHasMore(page.length === PAGE_SIZE);
      })
      .catch((e) => {
        setError(errorMessage(e));
        setEntries([]);
      });
  }, [token]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await listAuditLogs(token, entries?.length ?? 0, PAGE_SIZE);
      setEntries((list) => [...(list ?? []), ...page]);
      setHasMore(page.length === PAGE_SIZE);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  };

  if (entries === null) return <Spinner />;

  return (
    <section>
      <ErrorBanner message={error} />
      {entries.length === 0 ? (
        <p className="py-12 text-center text-gray-500">No changes recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">When</th>
                <th className="px-4 py-3 font-medium">Who</th>
                <th className="px-4 py-3 font-medium">What</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 align-top">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {e.created_at
                      ? new Date(e.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{e.actor_email ?? "deleted user"}</td>
                  <td className="px-4 py-3 text-gray-900">{describe(e)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}
