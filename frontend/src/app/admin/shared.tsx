import { AlertCircle } from "lucide-react";
import { ApiError } from "@/lib/api";
import { roleLabel } from "@/lib/permissions";

export function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.message : "Something went wrong.";
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-indigo-100 text-indigo-700",
  editor: "bg-teal-100 text-teal-700",
  user: "bg-gray-100 text-gray-600",
};

export function RoleBadge({ role }: { role?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        ROLE_COLORS[role ?? ""] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {roleLabel(role)}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );
}
