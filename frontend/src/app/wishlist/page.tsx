"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useWishlistStore } from "@/lib/store";
import { useProducts } from "@/lib/product-store";
import ProductCard from "@/components/ProductCard";
import ApiStatusBanner, { ProductGridSkeleton } from "@/components/ApiStatusBanner";

export default function WishlistPage() {
  const wishlist = useWishlistStore((s) => s.wishlist);
  const { products, status, isLoading, reload } = useProducts();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (isLoading && wishlist.length > 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-7xl mb-5">💝</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your wishlist is empty
        </h1>
        <p className="text-gray-500 mb-6">
          Save items you love by clicking the heart icon on any product.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Wishlist
          <span className="ml-2 text-base font-normal text-gray-500">
            ({wishlistProducts.length} items)
          </span>
        </h1>
      </div>
      {status === "offline" && (
        <div className="mb-5">
          <ApiStatusBanner status={status} onRetry={reload} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
