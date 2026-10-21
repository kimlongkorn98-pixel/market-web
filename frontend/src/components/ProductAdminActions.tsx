"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import type { Product } from "@/lib/data";
import { ApiError, deleteProduct, updateProduct } from "@/lib/api";
import { useAuthStore, useCan } from "@/lib/auth-store";
import { useProductStore } from "@/lib/product-store";

/**
 * Listing controls, shown only to users the API would allow:
 * - Feature/unfeature: products:update_any (editors, admins)
 * - Delete: the owner, or products:delete_any (admins)
 */
export default function ProductAdminActions({ product }: { product: Product }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const can = useCan();
  const updateInStore = useProductStore((s) => s.updateProduct);
  const removeFromStore = useProductStore((s) => s.removeProduct);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth state lives in localStorage, so only trust it after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Demo (offline) products have no numeric id on the server.
  if (!mounted || !token || !user || !/^\d+$/.test(product.id)) return null;

  const isOwner = product.sellerId === user.id;
  const canFeature = can("products:update_any");
  const canDelete = isOwner || can("products:delete_any");
  if (!canFeature && !canDelete) return null;

  const run = async (action: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-600">
        {isOwner ? "Your listing" : "Moderation"}
      </p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {canFeature && (
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                updateInStore(
                  await updateProduct(token, product.id, { is_flash_deal: !product.isFeatured })
                );
              })
            }
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-amber-300 hover:text-amber-600 disabled:opacity-50"
          >
            <Star className={`w-4 h-4 ${product.isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
            {product.isFeatured ? "Unfeature" : "Feature"}
          </button>
        )}
        {canDelete && (
          <button
            disabled={busy}
            onClick={() => {
              if (!window.confirm(`Delete "${product.title}"? This can't be undone.`)) return;
              run(async () => {
                await deleteProduct(product.id, token);
                removeFromStore(product.id);
                router.push("/products");
              });
            }}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete listing
          </button>
        )}
      </div>
    </div>
  );
}
