"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Heart,
  ShoppingBag,
  Mail,
  Calendar,
  Plus,
  LogOut,
  Trash2,
  Lock,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ApiStatusBanner, { ProductGridSkeleton } from "@/components/ApiStatusBanner";
import { useAuthStore } from "@/lib/auth-store";
import { useProducts, useProductStore } from "@/lib/product-store";
import { useWishlistStore } from "@/lib/store";
import { ApiError, deleteProduct } from "@/lib/api";
import ProfileSettings from "@/components/ProfileSettings";
import { RoleBadge } from "@/app/admin/shared";

const TABS = ["My Listings", "Purchases"] as const;
type Tab = (typeof TABS)[number];

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);
  const removeProduct = useProductStore((s) => s.removeProduct);
  const { products, status, isLoading, reload } = useProducts();

  const [activeTab, setActiveTab] = useState<Tab>("My Listings");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Auth state lives in localStorage, so only trust it after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re not signed in</h1>
        <p className="text-gray-500 mb-6">
          Sign in to see your profile and manage your listings.
        </p>
        <Link
          href="/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
        >
          Sign in or create account
        </Link>
      </div>
    );
  }

  const myListings = products.filter((p) => p.sellerId === user.id);

  const handleDelete = async (id: string, title: string) => {
    if (!accessToken || !window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setActionError(null);
    setDeletingId(id);
    try {
      await deleteProduct(id, accessToken);
      removeProduct(id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        router.push("/login");
        return;
      }
      setActionError(err instanceof ApiError ? err.message : "Could not delete the listing.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-bold shrink-0">
            {user.name.trim().charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{user.name}</h1>
              {user.role && user.role !== "user" && <RoleBadge role={user.role} />}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1 min-w-0">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 border border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: "Active Listings", value: isLoading ? "…" : myListings.length, icon: <Package className="w-5 h-5 text-indigo-500" /> },
            { label: "Purchases", value: 0, icon: <ShoppingBag className="w-5 h-5 text-green-500" /> },
            { label: "Wishlisted", value: wishlistCount, icon: <Heart className="w-5 h-5 text-red-500" /> },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/sell"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
        <Link
          href="/wishlist"
          className="flex items-center gap-2 border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 px-5 py-2.5 rounded-2xl font-medium transition-colors"
        >
          <Heart className="w-4 h-4" />
          Wishlist
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "My Listings" && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
            <span className="text-sm text-gray-500">
              {myListings.length} active
            </span>
          </div>
          {status === "offline" && (
            <div className="mb-4">
              <ApiStatusBanner status={status} onRetry={reload} />
            </div>
          )}
          {actionError && (
            <p className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{actionError}</p>
          )}
          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : myListings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No listings yet.</p>
              <Link
                href="/sell"
                className="inline-block mt-3 text-indigo-600 font-medium hover:text-indigo-700"
              >
                Create your first listing →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {myListings.map((product) => (
                <div key={product.id} className="flex flex-col gap-2">
                  <div className="flex-1">
                    <ProductCard product={product} />
                  </div>
                  <button
                    onClick={() => handleDelete(product.id, product.title)}
                    disabled={deletingId === product.id}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-500 hover:border-red-200 hover:text-red-600 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === product.id ? "Deleting…" : "Delete listing"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "Purchases" && (
        <section>
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent purchases.</p>
            <Link
              href="/products"
              className="inline-block mt-3 text-indigo-600 font-medium hover:text-indigo-700"
            >
              Start shopping →
            </Link>
          </div>
        </section>
      )}

      <div className="mt-8">
        <ProfileSettings />
      </div>
    </div>
  );
}
