import Link from "next/link";
import {
  Search,
  TrendingUp,
  ShieldCheck,
  Truck,
  RefreshCw,
  ArrowRight,
  Star,
} from "lucide-react";
import { categories, getFeaturedProducts, products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Buy & Sell Anything,{" "}
            <span className="text-indigo-200">Anywhere</span>
          </h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join millions of users buying and selling new and used items. Find
            amazing deals or list your items in minutes.
          </p>

          {/* Hero Search */}
          <form
            action="/products"
            method="GET"
            className="flex gap-2 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="search"
                type="text"
                placeholder="What are you looking for?"
                className="w-full pl-12 pr-4 py-3 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-3 rounded-2xl transition-colors shadow-lg whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {["MacBook", "iPhone", "Jordan 1", "Sofa", "Drone", "PS5"].map(
              (term) => (
                <Link
                  key={term}
                  href={`/products?search=${encodeURIComponent(term)}`}
                  className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
                >
                  {term}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: "2M+", label: "Active Listings" },
            { value: "500K+", label: "Happy Buyers" },
            { value: "150K+", label: "Sellers" },
            { value: "4.8★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-indigo-600">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Shop by Category
          </h2>
          <Link
            href="/products"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-xs font-medium text-gray-700 text-center">
                {cat.name}
              </span>
              <span className="text-xs text-gray-400">{cat.count.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Deals
              </h2>
            </div>
            <Link
              href="/products?featured=true"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
            >
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Listings
          </h2>
          <Link
            href="/products"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why MarketHub */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose MarketHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
                title: "Buyer Protection",
                desc: "Every purchase is protected. Get a full refund if your item doesn't arrive or isn't as described.",
              },
              {
                icon: <Truck className="w-8 h-8 text-blue-500" />,
                title: "Fast Shipping",
                desc: "Most sellers ship within 24 hours. Track your package every step of the way.",
              },
              {
                icon: <RefreshCw className="w-8 h-8 text-purple-500" />,
                title: "Easy Returns",
                desc: "Not satisfied? Return your item within 30 days, no questions asked.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">
            Ready to Start Selling?
          </h2>
          <p className="text-indigo-100 mb-6">
            List your first item in under 2 minutes. It's free to list!
          </p>
          <Link
            href="/sell"
            className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Start Selling Today
          </Link>
        </div>
      </section>
    </div>
  );
}
