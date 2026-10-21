"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { createUser, type AuthUser } from "@/lib/api";
import { useAuthStore, useCan } from "@/lib/auth-store";
import { outranks, roleLabel } from "@/lib/permissions";
import { ErrorBanner, errorMessage } from "./shared";

/**
 * "Create account" panel. Accounts created by someone who can't approve
 * (admins) are saved as pending and need a super admin's approval.
 */
export default function CreateUserForm({
  roleNames,
  onCreated,
  onClose,
}: {
  roleNames: string[];
  onCreated: (user: AuthUser) => void;
  onClose: () => void;
}) {
  const token = useAuthStore((s) => s.accessToken)!;
  const me = useAuthStore((s) => s.user);
  const can = useCan();
  const needsApproval = !can("users:approve");
  // Other roles need roles:assign and must rank below the creator.
  const roleOptions = can("roles:assign")
    ? roleNames.filter((r) => outranks(me, r))
    : ["user"];

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) return setError("Enter the person's full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError("Enter a valid email address.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");

    setBusy(true);
    try {
      onCreated(await createUser(token, { ...form, name: form.name.trim() }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <form onSubmit={submit} noValidate className="mb-5 rounded-2xl border border-indigo-100 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Create account</h3>
          <p className="text-sm text-gray-500">
            {needsApproval
              ? "The account will be pending until a super admin approves it."
              : "The account can sign in immediately."}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <ErrorBanner message={error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input aria-label="Full name" placeholder="Full name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
        <input aria-label="Email" type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
        <input aria-label="Temporary password" type="password" placeholder="Temporary password (min 8)"
          autoComplete="new-password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} />
        <select aria-label="Role" value={form.role} disabled={roleOptions.length < 2}
          onChange={(e) => setForm({ ...form, role: e.target.value })} className={input}>
          {roleOptions.map((r) => (
            <option key={r} value={r}>{roleLabel(r)}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          <UserPlus className="w-4 h-4" />
          {busy ? "Creating…" : needsApproval ? "Create & send for approval" : "Create account"}
        </button>
      </div>
    </form>
  );
}
