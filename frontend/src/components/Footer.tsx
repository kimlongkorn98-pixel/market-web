import Link from "next/link";
import { Store, Globe, MessageSquare, Camera, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                Market<span className="text-indigo-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              The best marketplace to buy and sell new and used items. Join
              millions of users today.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Camera className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Buy */}
          <div>
            <h4 className="font-semibold text-white mb-3">Buy</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">Browse All</Link></li>
              <li><Link href="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=home" className="hover:text-white transition-colors">Home & Garden</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="font-semibold text-white mb-3">Sell</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sell" className="hover:text-white transition-colors">List an Item</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">My Listings</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Seller Tips</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Seller Protection</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-gray-500">
            © 2024 MarketHub. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
