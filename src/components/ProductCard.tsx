"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Star, Eye, Zap } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCartStore, useWishlistStore } from "@/lib/store";

interface ProductCardProps {
  product: Product;
}

const conditionColors: Record<string, string> = {
  new: "bg-green-100 text-green-700",
  "like-new": "bg-blue-100 text-blue-700",
  good: "bg-yellow-100 text-yellow-700",
  fair: "bg-orange-100 text-orange-700",
};

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {product.isFeatured && (
              <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> Featured
              </span>
            )}
            {discount && discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
          </div>
          {/* Condition badge */}
          <div className="absolute bottom-2 left-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                conditionColors[product.condition]
              }`}
            >
              {product.condition.replace("-", " ")}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-indigo-600 transition-colors mb-1">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rating & Views */}
        {product.rating && (
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-600">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Eye className="w-3 h-3" />
              <span className="text-xs">{product.views}</span>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 mb-3">
          <MapPin className="w-3 h-3" />
          <span className="text-xs truncate">{product.location}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-xl border transition-colors ${
              wishlisted
                ? "bg-red-50 border-red-200 text-red-500"
                : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${wishlisted ? "fill-red-500" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
