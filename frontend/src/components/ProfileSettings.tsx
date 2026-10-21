"use client";

import { useState } from "react";
import { Check, KeyRound, UserRound } from "lucide-react";
import { ApiError, updateMe } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

/** Edit your own name and password (PATCH /api/auth/me). */
export default function ProfileSettings() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState<"name" | "password" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!token || !user) return null;

  const submit = async (kind: "name" | "password") => {
    setMessage(null);
    if (kind === "name" && !name.trim()) {
      setMessage({ ok: false, text: "Name can't be empty." });
      return;
    }
    if (kind === "password" && newPassword.length < 8) {
      setMessage({ ok: false, text: "New password must be at least 8 characters." });
      return;
    }
    setBusy(kind);
    try {
      const updated = await updateMe(
        token,
        kind === "name"
          ? { name: name.trim() }
          : { current_password: currentPassword, new_password: newPassword }
      );
      setUser(updated);
      setCurrentPassword("");
      setNewPassword("");
      setMessage({ ok: true, text: kind === "name" ? "Name updated." : "Password changed." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof ApiError ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Account settings</h2>
      {message && (
        <p
          className={`mb-4 flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm ${
            message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.ok && <Check className="w-4 h-4" />} {message.text}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit("name");
          }}
          className="space-y-3"
        >
          <label htmlFor="profile-name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <UserRound className="w-4 h-4" /> Display name
          </label>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          <button
            type="submit"
            disabled={busy !== null || name.trim() === user.name}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {busy === "name" ? "Saving…" : "Save name"}
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit("password");
          }}
          className="space-y-3"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <KeyRound className="w-4 h-4" /> Change password
          </span>
          <input
            type="password"
            aria-label="Current password"
            placeholder="Current password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            aria-label="New password"
            placeholder="New password (min 8 characters)"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy !== null || !currentPassword || !newPassword}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {busy === "password" ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>
    </section>
  );
}
