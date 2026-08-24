"use client";

import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Tag } from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } =
    useCartStore();

  const total = totalPrice();
  const count = totalItems();
  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08;

  if (count === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-7xl mb-5">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/products"
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart
          <span className="ml-2 text-base font-normal text-gray-500">
            ({count} {count === 1 ? "item" : "items"})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => {
            const discount = product.originalPrice
              ? Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )
              : null;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
              >
                {/* Image */}
                <Link href={`/products/${product.id}`} className="shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors mb-1">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                    <span className="capitalize">
                      Condition: {product.condition.replace("-", " ")}
                    </span>
                    <span>·</span>
                    <span>Seller: {product.seller.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                    {discount && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                        -{discount}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity & Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <p className="text-sm font-bold text-indigo-600 text-right mb-1">
                      ${(product.price * quantity).toLocaleString()}
                    </p>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(product.id, quantity - 1)
                        }
                        className="px-2 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm font-medium text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(product.id, quantity + 1)
                        }
                        className="px-2 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Clear cart */}
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({count} items)
                </span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs text-amber-700">
                  Add ${(50 - total).toFixed(2)} more for free shipping!
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-3 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${(total + shipping + tax).toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                Apply
              </button>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Proceed to Checkout
            </button>

            <div className="flex items-center gap-2 justify-center mt-3">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs text-gray-400 text-center">
                Secure checkout · Buyer protection guaranteed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
