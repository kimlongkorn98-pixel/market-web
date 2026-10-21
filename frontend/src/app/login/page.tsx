"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { ADMIN_AREA_PERMISSIONS, hasPermission } from "@/lib/permissions";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function validate(): string | null {
    if (isRegistering && name.trim().length < 2) return "Enter your full name.";
    if (!emailValid) return "Enter a valid email address.";
    if (password.length < 8) return "Use at least 8 characters for your password.";
    if (isRegistering && password !== confirm) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const err = isRegistering
      ? await register(name, email, password)
      : await login(email, password);
    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }
    // Go back to where the user came from (e.g. the Admin Portal button);
    // otherwise admins land in the admin portal, everyone else on their profile.
    // Only same-site paths are allowed, to avoid open redirects.
    const next = new URLSearchParams(window.location.search).get("next");
    const user = useAuthStore.getState().user;
    const isAdmin = ADMIN_AREA_PERMISSIONS.some((p) => hasPermission(user, p));
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    router.push(safeNext ?? (isAdmin ? "/admin" : "/profile"));
  }

  function switchMode() {
    setIsRegistering((v) => !v);
    setError(null);
    setPassword("");
    setConfirm("");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRegistering ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {isRegistering
              ? "Register to buy and sell on MarketHub."
              : "Sign in to continue to MarketHub."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm password
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-3 py-2.5 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {submitting
                ? "Please wait…"
                : isRegistering
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            {isRegistering ? "Already have an account?" : "New to MarketHub?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              {isRegistering ? "Sign in" : "Create one"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
