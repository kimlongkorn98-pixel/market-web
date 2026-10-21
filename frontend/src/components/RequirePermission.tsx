"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { hasPermission } from "@/lib/permissions";

/**
 * Page guard. Renders `children` only for a signed-in user holding at least
 * one of `anyOf`. This is a UX layer: the API still rejects every request
 * the user isn't allowed to make.
 */
export default function RequirePermission({
  anyOf,
  children,
}: {
  anyOf: string[];
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Auth state lives in localStorage, so only trust it after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;

  if (!isAuthenticated || !user) {
    return (
      <GuardMessage
        icon={<Lock className="w-7 h-7 text-indigo-600" />}
        title="Please sign in"
        text="You need to be signed in to view this page."
        action={{
          href: `/login?next=${encodeURIComponent(window.location.pathname)}`,
          label: "Sign in",
        }}
      />
    );
  }

  if (!anyOf.some((code) => hasPermission(user, code))) {
    return (
      <GuardMessage
        icon={<ShieldAlert className="w-7 h-7 text-red-500" />}
        title="Access denied"
        text="Your account doesn't have permission to view this page."
        action={{ href: "/", label: "Back to home" }}
      />
    );
  }

  return <>{children}</>;
}

function GuardMessage({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">{text}</p>
      <Link
        href={action.href}
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
      >
        {action.label}
      </Link>
    </div>
  );
}
