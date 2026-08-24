import Link from "next/link";
import {
  BadgeCheck,
  Star,
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  Calendar,
  Edit,
  Plus,
} from "lucide-react";
import { sellers, products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

const currentSeller = sellers[0]; // Simulating logged-in user
const myListings = products.filter((p) => p.seller.id === currentSeller.id);
const soldItems = [
  {
    id: "s1",
    title: "Canon EF 50mm f/1.4 Lens",
    price: 180,
    soldAt: "2024-01-02",
    buyer: "Mark T.",
  },
  {
    id: "s2",
    title: "Vintage Levi's Jacket",
    price: 95,
    soldAt: "2023-12-28",
    buyer: "Sarah K.",
  },
];

const TABS = ["My Listings", "Sold Items", "Purchases"] as const;
type Tab = (typeof TABS)[number];

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={currentSeller.avatar}
            alt={currentSeller.name}
            className="w-20 h-20 rounded-full bg-gray-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentSeller.name}
              </h1>
              {currentSeller.verified && (
                <BadgeCheck className="w-6 h-6 text-indigo-500" />
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-gray-900">
                  {currentSeller.rating}
                </span>{" "}
                rating
              </div>
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                <span>{currentSeller.totalSales} total sales</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{currentSeller.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Member since{" "}
                  {new Date(currentSeller.joinedAt).toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )}
                </span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: "Active Listings", value: myListings.length, icon: <Package className="w-5 h-5 text-indigo-500" /> },
            { label: "Items Sold", value: soldItems.length, icon: <ShoppingBag className="w-5 h-5 text-green-500" /> },
            { label: "Wishlisted", value: 12, icon: <Heart className="w-5 h-5 text-red-500" /> },
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

      {/* My Listings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
          <span className="text-sm text-gray-500">
            {myListings.length} active
          </span>
        </div>
        {myListings.length === 0 ? (
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Sold Items */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sold Items</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">
                  Item
                </th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">
                  Buyer
                </th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {soldItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.buyer}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">
                    ${item.price}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(item.soldAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
