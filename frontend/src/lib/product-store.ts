"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { fetchProducts } from "./api";
import { products as demoProducts, type Product } from "./data";

/**
 * - loading: first fetch in flight
 * - ready:   `products` came from the backend
 * - offline: backend unreachable, `products` is the bundled demo data
 */
export type ProductsStatus = "idle" | "loading" | "ready" | "offline";

interface ProductStore {
  products: Product[];
  status: ProductsStatus;
  load: (force?: boolean) => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: [],
  status: "idle",

  load: async (force = false) => {
    const { status } = get();
    if (status === "loading" || (!force && status !== "idle")) return;
    set({ status: "loading" });
    try {
      set({ products: await fetchProducts(), status: "ready" });
    } catch {
      set({ products: demoProducts, status: "offline" });
    }
  },

  addProduct: (product) => set({ products: [product, ...get().products] }),
  updateProduct: (product) =>
    set({ products: get().products.map((p) => (p.id === product.id ? product : p)) }),
  removeProduct: (id) =>
    set({ products: get().products.filter((p) => p.id !== id) }),
}));

/** Product list shared by every page; triggers the first fetch on mount. */
export function useProducts() {
  const products = useProductStore((s) => s.products);
  const status = useProductStore((s) => s.status);
  const load = useProductStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return {
    products,
    status,
    isLoading: status === "idle" || status === "loading",
    reload: () => load(true),
  };
}
