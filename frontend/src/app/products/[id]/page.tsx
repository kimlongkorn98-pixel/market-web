"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Eye,
  Heart,
  ShoppingCart,
  Shield,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  BadgeCheck,
  Calendar,
  Tag,
} from "lucide-react";
import type { Product } from "@/lib/data";
import { fetchProduct } from "@/lib/api";
import { useProducts } from "@/lib/product-store";
import { useCartStore, useWishlistStore } from "@/lib/store";
import ProductCard, { discountPercent } from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import ProductAdminActions from "@/components/ProductAdminActions";

const conditionColors: Record<string, string> = {
  new: "bg-green-100 text-green-700 border-green-200",
  "like-new": "bg-blue-100 text-blue-700 border-blue-200",
  good: "bg-yellow-100 text-yellow-700 border-yellow-200",
  fair: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products, status, isLoading } = useProducts();
  const cached = products.find((p) => p.id === id);

  // Product not in the shared list (e.g. listed after it loaded): ask the API.
  const [fetched, setFetched] = useState<Product | null | undefined>(undefined);
  useEffect(() => {
    if (isLoading || cached || status === "offline") return;
    let cancelled = false;
    fetchProduct(id)
      .then((p) => !cancelled && setFetched(p))
      .catch(() => !cancelled && setFetched(null));
    return () => {
      cancelled = true;
    };
  }, [id, isLoading, cached, status]);

  const product = cached ?? fetched;

  if (!product) {
    const settled = !isLoading && (status === "offline" || fetched === null);
    if (settled) notFound();
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return <ProductDetail product={product} products={products} />;
}

function ProductDetail({
  product,
  products,
}: {
  product: Product;
  products: Product[];
}) {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const wishlisted = useWishlistStore((state) => state.wishlist.includes(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const discount = discountPercent(product);

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600">
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-indigo-600 capitalize"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
            <ProductImage
              src={product.images[currentImage]}
              alt={product.title}
              className="w-full h-full"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )
                  }
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            {discount && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-lg">
                -{discount}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    currentImage === i
                      ? "border-indigo-500"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {product.title}
            </h1>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`p-2.5 rounded-xl border flex-shrink-0 transition-colors ${
                wishlisted
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${wishlisted ? "fill-red-500" : ""}`}
              />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">
              ${product.price.toLocaleString()}
            </span>
            {discount && (
              <span className="text-xl text-gray-400 line-through">
                ${product.originalPrice!.toLocaleString()}
              </span>
            )}
            {discount && (
              <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded-lg">
                Save ${(product.originalPrice! - product.price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 mb-5">
            {product.condition && (
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full border capitalize ${
                  conditionColors[product.condition]
                }`}
              >
                {product.condition.replace("-", " ")}
              </span>
            )}
            {!!product.rating && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-gray-400">
                  ({product.reviewCount ?? 0} reviews)
                </span>
              </div>
            )}
            {!!product.views && (
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{product.views} views</span>
              </div>
            )}
          </div>

          {/* Location & Date */}
          <div className="flex gap-4 mb-5">
            {product.location && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {product.location}
              </div>
            )}
            {product.createdAt && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(product.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {product.tags.map((tag) => (
              <Link
                key={tag}
                href={`/products?search=${encodeURIComponent(tag)}`}
                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 px-2.5 py-1 rounded-full transition-colors"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Link>
            ))}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-2 font-medium text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-colors ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {addedToCart ? "Added to Cart!" : "Add to Cart"}
              </button>
              <Link
                href="/cart"
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-2xl font-semibold transition-colors"
              >
                Buy Now
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl mb-5">
            {[
              { icon: <Shield className="w-4 h-4 text-green-500" />, label: "Buyer Protected" },
              { icon: <Truck className="w-4 h-4 text-blue-500" />, label: "Fast Shipping" },
              { icon: <RefreshCw className="w-4 h-4 text-purple-500" />, label: "Easy Returns" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-center">
                {b.icon}
                <span className="text-xs text-gray-600">{b.label}</span>
              </div>
            ))}
          </div>

          <ProductAdminActions product={product} />

          {/* Seller Card */}
          {product.seller && (
          <div className="border border-gray-200 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={product.seller.avatar}
                alt={product.seller.name}
                className="w-12 h-12 rounded-full bg-gray-100"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900">
                    {product.seller.name}
                  </span>
                  {product.seller.verified && (
                    <BadgeCheck className="w-4 h-4 text-indigo-500" />
                  )}
                </div>
                {product.seller.rating !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.seller.rating}</span>
                    <span>·</span>
                    <span>{product.seller.totalSales} sales</span>
                  </div>
                )}
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <MessageCircle className="w-4 h-4" />
              Message Seller
            </button>
          </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
