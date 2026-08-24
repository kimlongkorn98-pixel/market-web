"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Heart,
  Store,
  Tag,
  ScanLine,
  ChevronDown,
  Home,
  Package,
  ShoppingBag,
  Bell,
  MessageCircle,
  Settings,
  HelpCircle,
  LogOut,
  TrendingUp,
  Star,
  Shield,
  ChevronRight,
  User,
} from "lucide-react";
import { useCartStore } from "@/lib/store";

const LANGUAGES = [
  { code: "km", label: "ខ្មែរ", flag: "🇰🇭", name: "Khmer" },
  { code: "en", label: "English", flag: "🇺🇸", name: "English" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", name: "Vietnam" },
];

const NAV_LINKS = [
  { href: "/products", label: "Browse" },
  { href: "/products?category=electronics", label: "Electronics" },
  { href: "/products?category=fashion", label: "Fashion" },
  { href: "/products?category=home", label: "Home" },
  { href: "/products?category=sports", label: "Sports" },
];

const MENU_SECTIONS = [
  {
    title: "Main",
    items: [
      { href: "/", icon: Home, label: "Home", color: "text-indigo-500" },
      { href: "/products", icon: ShoppingBag, label: "Browse Products", color: "text-blue-500" },
      { href: "/sell", icon: Tag, label: "Sell an Item", color: "text-green-500", badge: "Free" },
      { href: "/profile", icon: User, label: "My Profile", color: "text-purple-500" },
    ],
  },
  {
    title: "My Activity",
    items: [
      { href: "/cart", icon: ShoppingCart, label: "My Cart", color: "text-orange-500" },
      { href: "/wishlist", icon: Heart, label: "Wishlist", color: "text-red-500" },
      { href: "/profile", icon: Package, label: "My Listings", color: "text-teal-500" },
      { href: "#", icon: TrendingUp, label: "Sales Dashboard", color: "text-emerald-500" },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "#", icon: MessageCircle, label: "Messages", color: "text-sky-500", badge: "3" },
      { href: "#", icon: Bell, label: "Notifications", color: "text-amber-500", badge: "5" },
      { href: "#", icon: Star, label: "Reviews", color: "text-yellow-500" },
    ],
  },
  {
    title: "Support & Settings",
    items: [
      { href: "#", icon: Settings, label: "Settings", color: "text-gray-500" },
      { href: "#", icon: Shield, label: "Privacy & Safety", color: "text-indigo-400" },
      { href: "#", icon: HelpCircle, label: "Help & Support", color: "text-blue-400" },
      { href: "#", icon: LogOut, label: "Log Out", color: "text-red-400" },
    ],
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(LANGUAGES[1]);
  const langRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar when clicking backdrop
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* Hamburger — top-left (all screens) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:inline">
                Market<span className="text-indigo-600">Hub</span>
              </span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex items-center border-2 border-indigo-500 rounded-full overflow-hidden bg-white focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Search className="w-4 h-4 text-indigo-400 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, brands, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 min-w-0"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 transition-colors shrink-0 flex items-center justify-center"
                  title="Scan"
                >
                  <ScanLine className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              <Link
                href="/sell"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                Sell
              </Link>

              <Link href="/wishlist" className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>

              <Link href="/cart" className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Cart">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <button className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center leading-none">5</span>
              </button>

              {/* Language Picker */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Select language"
                >
                  <img src="/world.png" alt="language" className="w-5 h-5 opacity-60" />
                  <span className="text-base leading-none">{currentLang.flag}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Language</p>
                    </div>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setCurrentLang(lang); setLangOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${currentLang.code === lang.code ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <div className="text-left">
                          <p className="font-medium text-sm leading-tight">{lang.name}</p>
                          <p className="text-xs text-gray-400">{lang.label}</p>
                        </div>
                        {currentLang.code === lang.code && <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile */}
              <Link href="/profile" className="w-9 h-9 bg-indigo-100 hover:bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm transition-colors" title="My Profile">
                A
              </Link>
            </div>

            {/* Mobile right */}
            <div className="flex items-center gap-1 md:hidden shrink-0">
              <Link href="/cart" className="relative p-2 text-gray-600">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Category nav — desktop */}
        <div className="hidden md:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center overflow-x-auto">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 whitespace-nowrap transition-colors font-medium">
                  {link.label}
                </Link>
              ))}
              <Link href="/sell" className="text-sm text-green-600 hover:text-green-700 hover:bg-green-50 px-4 py-2.5 whitespace-nowrap transition-colors font-semibold ml-auto">
                + List an Item Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Sidebar Overlay ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sidebar panel */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col overflow-hidden">

            {/* Sidebar header */}
            <div className="flex items-center justify-between px-5 py-4 bg-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Alex Johnson</p>
                  <p className="text-indigo-200 text-xs">alex@example.com</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu items — scrollable */}
            <div className="flex-1 overflow-y-auto py-3">
              {MENU_SECTIONS.map((section) => (
                <div key={section.title} className="mb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-2">
                    {section.title}
                  </p>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {item.label}
                        </span>
                        {"badge" in item && item.badge && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badge === "Free" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                      </Link>
                    );
                  })}
                  <div className="mx-5 border-b border-gray-100 mt-1" />
                </div>
              ))}

              {/* Language in sidebar */}
              <div className="px-5 py-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Language</p>
                <div className="flex flex-col gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setCurrentLang(lang)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-sm ${
                        currentLang.code === lang.code
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold"
                          : "border-gray-100 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <div className="text-left">
                        <p className="font-medium text-sm leading-tight">{lang.name}</p>
                        <p className="text-xs text-gray-400">{lang.label}</p>
                      </div>
                      {currentLang.code === lang.code && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar footer — version */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">MarketHub v1.0 · © 2024</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
