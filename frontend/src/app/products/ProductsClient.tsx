"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { categories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import ApiStatusBanner, { ProductGridSkeleton } from "@/components/ApiStatusBanner";
import { useProducts } from "@/lib/product-store";
import { useTranslation } from "@/lib/i18n";
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
  const router = useRouter();
  const { t } = useTranslation();
  const { products, status, isLoading, reload } = useProducts();

  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const featuredOnly = searchParams.get("featured") === "true";

  const [search, setSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  
  // Sync state when URL parameters change (e.g., clicking "Browse All" in
  // navigation). Adjusting state during render avoids an extra effect pass.
  const [prevUrl, setPrevUrl] = useState({ urlSearch, urlCategory });
  if (prevUrl.urlSearch !== urlSearch || prevUrl.urlCategory !== urlCategory) {
    setPrevUrl({ urlSearch, urlCategory });
    setSearch(urlSearch);
    setSelectedCategory(urlCategory);
  }

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Helper to update URL when category changes
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (featuredOnly) result = result.filter((p) => p.isFeatured);
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
      result = result.filter((p) => p.condition && selectedConditions.includes(p.condition));
    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "popular":
        result.sort((a, b) => (b.reviewCount ?? b.views ?? 0) - (a.reviewCount ?? a.views ?? 0));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return result;
  }, [products, featuredOnly, search, selectedCategory, selectedConditions, minPrice, maxPrice, sortBy]);

  const toggleCondition = (c: string) =>
    setSelectedConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const clearFilters = () => {
    setSearch(""); 
    handleCategoryChange(""); 
    setSelectedConditions([]);
    setMinPrice(""); 
    setMaxPrice(""); 
    setSortBy("newest");
    if (featuredOnly || urlSearch) router.replace("/products", { scroll: false });
  };

  const activeFilterCount = [selectedCategory, ...selectedConditions, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCategory
              ? t(`cat_${selectedCategory}`)
              : search ? `${t("results_for")} "${search}"` : featuredOnly ? "Featured deals" : t("all_products")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{isLoading ? "Loading…" : `${filtered.length} ${t("listings_found")}`}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-2 h-[42px] text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer transition-colors hover:border-indigo-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border rounded-xl px-4 py-2 h-[42px] text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-gray-200 text-gray-700 hover:border-indigo-300 bg-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t("filters")}
            {activeFilterCount > 0 && (
              <span className="bg-white text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {status === "offline" && (
        <div className="mb-5">
          <ApiStatusBanner status={status} onRetry={reload} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-full sm:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t("filters")}</h3>
                <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-700">{t("clear_all")}</button>
              </div>
              {/* Category */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t("category")}</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!selectedCategory ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {t("all_categories")}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === cat.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span>{cat.icon}</span> {t(`cat_${cat.id}`)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Condition */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t("condition")}</h4>
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t("price_range")}</h4>
                <div className="flex gap-2">
                  <input type="number" placeholder={t("min")} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  <input type="number" placeholder={t("max")} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
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
              onClick={() => handleCategoryChange("")}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${!selectedCategory ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}
            >
              {t("all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${selectedCategory === cat.id ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}
              >
                {cat.icon} {t(`cat_${cat.id}`)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("no_products")}</h3>
              <p className="text-gray-500 mb-4">{t("try_adjusting")}</p>
              <button onClick={clearFilters} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                {t("clear_filters")}
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
