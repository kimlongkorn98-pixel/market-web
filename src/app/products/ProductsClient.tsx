"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { products, categories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import {
  SlidersHorizontal,
  X,
  Search,
} from "lucide-react";

const CONDITIONS = ["new", "like-new", "good", "fair"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (selectedConditions.length > 0)
      result = result.filter((p) => selectedConditions.includes(p.condition));
    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "popular": result.sort((a, b) => b.views - a.views); break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [search, selectedCategory, selectedConditions, minPrice, maxPrice, sortBy]);

  const toggleCondition = (c: string) =>
    setSelectedConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const clearFilters = () => {
    setSearch(""); setSelectedCategory(""); setSelectedConditions([]);
    setMinPrice(""); setMaxPrice(""); setSortBy("newest");
  };

  const activeFilterCount = [selectedCategory, ...selectedConditions, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name || "Products"
              : search ? `Results for "${search}"` : "All Products"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} listings found</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-gray-200 text-gray-700 hover:border-indigo-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-700">Clear all</button>
              </div>
              {/* Category */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!selectedCategory ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === cat.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Condition */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Condition</h4>
                <div className="space-y-1">
                  {CONDITIONS.map((cond) => (
                    <label key={cond} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                      <input type="checkbox" checked={selectedConditions.includes(cond)} onChange={() => toggleCondition(cond)} className="accent-indigo-600" />
                      <span className="capitalize">{cond.replace("-", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Price */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setSelectedCategory("")}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${!selectedCategory ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${selectedCategory === cat.id ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
