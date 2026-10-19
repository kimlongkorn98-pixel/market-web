import { Suspense } from "react";
import ProductsClient from "./ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | MarketHub",
  description: "Browse all products on MarketHub.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
      <ProductsClient />
    </Suspense>
  );
}
