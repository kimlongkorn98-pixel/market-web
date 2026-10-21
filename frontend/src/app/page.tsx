"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, RefreshCw, Search, ShieldCheck, Sparkles, TrendingUp, Truck } from "lucide-react";
import { categories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import ApiStatusBanner, { ProductGridSkeleton } from "@/components/ApiStatusBanner";
import { useTranslation } from "@/lib/i18n";
import { useProducts } from "@/lib/product-store";

export default function HomePage() {
  const { t } = useTranslation();
  const { products, status, isLoading, reload } = useProducts();
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);
  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="overflow-hidden">
      <section className="relative isolate bg-slate-950 text-white">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute -top-36 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-indigo-100 shadow-lg shadow-indigo-950/20 backdrop-blur"><Sparkles className="h-4 w-4 text-amber-300" /> A better way to buy and sell locally</div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.08]">{t("hero_title1")} {" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-violet-300">{t("hero_title2")}</span></h1>
          <p className="mt-5 text-base sm:text-lg text-indigo-100/90 max-w-2xl mx-auto leading-relaxed">{t("hero_subtitle")}</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3"><Link href="/products" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-indigo-950 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-black/20 hover:-translate-y-0.5"><Search className="h-4 w-4" /> {t("start_browsing")}</Link><Link href="/sell" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-semibold px-6 py-3.5 rounded-xl transition-colors border border-white/15">{t("list_item")}</Link></div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-indigo-100/85"><span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-300" /> Verified sellers</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Protected purchases</span><span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-emerald-300" /> Simple local delivery</span></div>
        </div>
      </section>

      <section className="bg-white dark-surface border-b border-gray-100 py-5"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-y-5 text-center divide-x divide-gray-100">{[{ value: "2M+", label: t("active_listings") }, { value: "500K+", label: t("happy_buyers") }, { value: "150K+", label: t("sellers_stat") }, { value: "4.8★", label: t("avg_rating") }].map((stat) => <div key={stat.label}><div className="text-2xl font-bold tracking-tight text-indigo-600">{stat.value}</div><div className="text-xs text-gray-500">{stat.label}</div></div>)}</div></section>

      {status === "offline" && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"><ApiStatusBanner status={status} onRetry={reload} /></div>}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"><div className="flex items-end justify-between mb-7"><div><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Browse with ease</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{t("shop_by_category")}</h2></div><Link href="/products" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">{t("view_all")} <ArrowRight className="w-4 h-4" /></Link></div><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">{categories.map((cat) => <Link key={cat.id} href={`/products?category=${cat.id}`} className="flex flex-col items-center gap-2 p-4 bg-white dark-surface rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60 hover:-translate-y-1 transition-all duration-200 group"><span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span><span className="text-xs font-medium text-gray-700 text-center">{t(`cat_${cat.id}`)}</span><span className="text-xs text-gray-400">{isLoading ? "…" : categoryCounts[cat.id] ?? 0}</span></Link>)}</div></section>

      <section className="border-y border-indigo-100/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-14"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-end justify-between mb-7"><div><p className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-indigo-600"><TrendingUp className="w-4 h-4" /> Hand-picked today</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{t("featured_deals")}</h2></div><Link href="/products?featured=true" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">{t("see_all")} <ArrowRight className="w-4 h-4" /></Link></div>{isLoading ? <ProductGridSkeleton count={4} /> : featuredProducts.length === 0 ? <p className="text-sm text-gray-500">No featured deals yet.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>}</div></section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"><div className="flex items-end justify-between mb-7"><div><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Just added</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{t("recent_listings")}</h2></div><Link href="/products" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">{t("browse_all")} <ArrowRight className="w-4 h-4" /></Link></div>{isLoading ? <ProductGridSkeleton /> : recentProducts.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center"><p className="text-gray-500 mb-3">No listings yet — be the first to sell something.</p><Link href="/sell" className="text-indigo-600 font-semibold hover:text-indigo-700">List an item →</Link></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{recentProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>}</section>

      <section className="bg-white dark-surface border-t border-gray-100 py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><p className="text-center text-sm font-semibold uppercase tracking-widest text-indigo-600">Shop with confidence</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 text-center mb-10">Why Choose MarketHub?</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{[{ icon: <ShieldCheck className="w-7 h-7 text-green-600" />, title: "Buyer Protection", desc: "Every purchase is protected. Get a full refund if your item doesn't arrive or isn't as described." }, { icon: <Truck className="w-7 h-7 text-blue-600" />, title: "Fast Shipping", desc: "Most sellers ship within 24 hours. Track your package every step of the way." }, { icon: <RefreshCw className="w-7 h-7 text-purple-600" />, title: "Easy Returns", desc: "Not satisfied? Return your item within 30 days, no questions asked." }].map((item) => <div key={item.title} className="text-center px-5"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 mb-4">{item.icon}</div><h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3><p className="text-gray-500 text-sm leading-6">{item.desc}</p></div>)}</div></div></section>

      <section className="relative overflow-hidden bg-slate-950 py-16"><div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 opacity-90" /><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" /><div className="relative max-w-4xl mx-auto px-4 text-center text-white"><h2 className="text-3xl font-bold mb-3">Ready to Start Selling?</h2><p className="text-indigo-100 mb-6">List your first item in under 2 minutes. It&apos;s free to list!</p><Link href="/sell" className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-all hover:-translate-y-0.5 shadow-xl">Start Selling Today</Link></div></section>
    </div>
  );
}
