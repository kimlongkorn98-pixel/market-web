"use client";

import { WifiOff } from "lucide-react";
import type { ProductsStatus } from "@/lib/product-store";

/** Tells the user they're looking at demo data because the backend is down. */
export default function ApiStatusBanner({
  status,
  onRetry,
}: {
  status: ProductsStatus;
  onRetry: () => void;
}) {
  if (status !== "offline") return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        Can&apos;t reach the server — showing demo listings. Start the backend
        and try again.
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="font-semibold underline hover:text-amber-900"
      >
        Retry
      </button>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-[22rem] animate-pulse rounded-2xl border border-gray-100 bg-white dark-surface"
        >
          <div className="h-52 rounded-t-2xl bg-gray-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-gray-100" />
            <div className="h-5 w-1/3 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
