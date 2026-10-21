"use client";

import Link from "next/link";
import { Heart, MapPin, Star, Eye, Zap, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/data";
import { useCartStore, useWishlistStore } from "@/lib/store";
import ProductImage from "./ProductImage";

interface ProductCardProps { product: Product; }

export const conditionColors: Record<string, string> = { new: "bg-green-100 text-green-700", "like-new": "bg-blue-100 text-blue-700", good: "bg-yellow-100 text-yellow-700", fair: "bg-orange-100 text-orange-700" };

/** Percent off, or null when there is no (higher) original price. */
export function discountPercent(product: Product): number | null {
  if (!product.originalPrice || product.originalPrice <= product.price) return null;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) || null;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const wishlisted = useWishlistStore((state) => state.wishlist.includes(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return <div className="flex h-full flex-col bg-white dark-surface rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
    <Link href={`/products/${product.id}`} className="block relative"><div className="relative h-52 bg-gray-100 overflow-hidden"><ProductImage src={product.images[0]} alt={product.title} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-2.5 left-2.5 flex gap-1 flex-wrap">{product.isFeatured && <span className="flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-bold px-2 py-1 rounded-full"><Zap className="w-3 h-3" /> Featured</span>}{discount ? <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{discount}%</span> : null}</div>
      {product.condition && <div className="absolute bottom-2.5 left-2.5"><span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${conditionColors[product.condition]}`}>{product.condition.replace("-", " ")}</span></div>}
    </div></Link>
    <div className="flex flex-1 flex-col p-4"><Link href={`/products/${product.id}`}><h3 className="min-h-10 font-semibold text-gray-900 text-sm leading-5 line-clamp-2 hover:text-indigo-600 transition-colors mb-2">{product.title}</h3></Link>
      <div className="flex items-baseline gap-2 mb-3"><span className="text-xl font-bold tracking-tight text-gray-900">${product.price.toLocaleString()}</span>{discount ? <span className="text-sm text-gray-400 line-through">${product.originalPrice!.toLocaleString()}</span> : null}</div>
      {(product.rating || product.views) ? <div className="flex items-center gap-3 mb-2">{product.rating ? <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-xs text-gray-600">{product.rating} ({product.reviewCount ?? 0})</span></div> : null}{product.views ? <div className="flex items-center gap-1 text-gray-400"><Eye className="w-3 h-3" /><span className="text-xs">{product.views}</span></div> : null}</div> : null}
      {product.location && <div className="flex items-center gap-1 text-gray-400 mb-4"><MapPin className="w-3 h-3" /><span className="text-xs truncate">{product.location}</span></div>}
      <div className="flex gap-2 mt-auto"><button onClick={handleAdd} className={`flex-1 flex items-center justify-center gap-1 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200 ${added ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-700"}`}>{added ? <><Check className="w-3.5 h-3.5" /> Added</> : "Add to Cart"}</button><button onClick={() => toggleWishlist(product.id)} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"} className={`p-2.5 rounded-xl border transition-colors ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"}`}><Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500" : ""}`} /></button></div>
    </div>
  </div>;
}
