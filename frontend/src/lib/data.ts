// Shared types, category list, and offline demo data for the marketplace.
// Live products come from the backend (see lib/api.ts); `products` below is
// only shown when the backend can't be reached.

export type Condition = "new" | "like-new" | "good" | "fair";

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  condition?: Condition;
  images: string[];
  seller?: Seller;
  /** Backend user id of the seller (absent for demo data). */
  sellerId?: number;
  location?: string;
  createdAt: string;
  views?: number;
  isFeatured?: boolean;
  tags: string[];
  rating?: number;
  reviewCount?: number;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating?: number;
  totalSales?: number;
  joinedAt?: string;
  location?: string;
  verified?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: "electronics", name: "Electronics", icon: "💻", color: "bg-blue-100 text-blue-700" },
  { id: "fashion", name: "Fashion", icon: "👗", color: "bg-pink-100 text-pink-700" },
  { id: "home", name: "Home & Garden", icon: "🏠", color: "bg-green-100 text-green-700" },
  { id: "sports", name: "Sports", icon: "⚽", color: "bg-orange-100 text-orange-700" },
  { id: "vehicles", name: "Vehicles", icon: "🚗", color: "bg-red-100 text-red-700" },
  { id: "books", name: "Books", icon: "📚", color: "bg-yellow-100 text-yellow-700" },
  { id: "toys", name: "Toys & Games", icon: "🎮", color: "bg-purple-100 text-purple-700" },
  { id: "beauty", name: "Beauty", icon: "💄", color: "bg-rose-100 text-rose-700" },
  { id: "food", name: "Food & Drink", icon: "🍔", color: "bg-amber-100 text-amber-700" },
];

export const sellers: Seller[] = [
  {
    id: "seller-1",
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 4.8,
    totalSales: 142,
    joinedAt: "2022-03-15",
    location: "New York, NY",
    verified: true,
  },
  {
    id: "seller-2",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 4.9,
    totalSales: 289,
    joinedAt: "2021-07-22",
    location: "San Francisco, CA",
    verified: true,
  },
  {
    id: "seller-3",
    name: "Mike Torres",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    rating: 4.5,
    totalSales: 67,
    joinedAt: "2023-01-10",
    location: "Chicago, IL",
    verified: false,
  },
  {
    id: "seller-4",
    name: "Emma Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    rating: 4.7,
    totalSales: 198,
    joinedAt: "2022-09-05",
    location: "Austin, TX",
    verified: true,
  },
];

export const products: Product[] = [
  {
    id: "food-1",
    title: "Artisanal Dark Chocolate Truffles Box",
    price: 24.99,
    originalPrice: 30.00,
    description: "Handcrafted dark chocolate truffles made with 72% single-origin cacao. Box contains 12 pieces. Perfect for gifting or a personal treat.",
    category: "food",
    condition: "new",
    images: [
      "https://images.unsplash.com/photo-1548883354-94bcfe321cfa?w=600&auto=format&fit=crop",
    ],
    seller: sellers[1],
    location: "San Francisco, CA",
    createdAt: "2024-03-21T10:00:00Z",
    views: 125,
    isFeatured: true,
    tags: ["chocolate", "gift", "sweet", "artisanal"],
    rating: 4.9,
    reviewCount: 32,
  },
  {
    id: "food-2",
    title: "Organic Premium Matcha Green Tea Powder",
    price: 18.50,
    description: "Ceremonial grade matcha sourced directly from Uji, Japan. Rich in antioxidants and offers a smooth, umami flavor. 100g tin.",
    category: "food",
    condition: "new",
    images: [
      "https://images.unsplash.com/photo-1582793988951-9aed550c94d4?w=600&auto=format&fit=crop",
    ],
    seller: sellers[3],
    location: "Austin, TX",
    createdAt: "2024-03-20T14:30:00Z",
    views: 89,
    tags: ["tea", "matcha", "organic", "beverage"],
  },
  {
    id: "1",
    title: "Apple MacBook Pro 14\" M3 - Excellent Condition",
    price: 1499,
    originalPrice: 1999,
    description:
      "Selling my MacBook Pro 14-inch with M3 chip. Only 6 months old, comes with original box and charger. No scratches or dents. Battery health at 98%. Perfect for developers and creatives.",
    category: "electronics",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop",
    ],
    seller: sellers[0],
    location: "New York, NY",
    createdAt: "2024-01-15",
    views: 432,
    isFeatured: true,
    tags: ["macbook", "apple", "laptop", "m3"],
    rating: 4.8,
    reviewCount: 23,
  },
  {
    id: "2",
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: 249,
    originalPrice: 399,
    description:
      "Industry-leading noise cancellation headphones. Used for 3 months, perfect condition. Includes case, cables, and all accessories.",
    category: "electronics",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    ],
    seller: sellers[1],
    location: "San Francisco, CA",
    createdAt: "2024-01-14",
    views: 287,
    isFeatured: true,
    tags: ["sony", "headphones", "wireless", "noise-cancelling"],
    rating: 4.9,
    reviewCount: 45,
  },
  {
    id: "3",
    title: "Nike Air Jordan 1 Retro High OG - Size 10",
    price: 280,
    originalPrice: 170,
    description:
      "Deadstock pair of Air Jordan 1 Retro High OG Chicago colorway. Size 10. Never worn, comes with original box and receipt from Nike.",
    category: "fashion",
    condition: "new",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
    ],
    seller: sellers[2],
    location: "Chicago, IL",
    createdAt: "2024-01-13",
    views: 654,
    isFeatured: true,
    tags: ["nike", "jordan", "sneakers", "shoes"],
    rating: 4.5,
    reviewCount: 12,
  },
  {
    id: "4",
    title: "DJI Mini 3 Pro Drone with RC Controller",
    price: 650,
    originalPrice: 959,
    description:
      "DJI Mini 3 Pro drone with RC controller. Flown only 5 times. Includes 2 batteries, charging hub, ND filter set, and carrying case.",
    category: "electronics",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&auto=format&fit=crop",
    ],
    seller: sellers[3],
    location: "Austin, TX",
    createdAt: "2024-01-12",
    views: 389,
    isFeatured: false,
    tags: ["drone", "dji", "camera", "aerial"],
    rating: 4.7,
    reviewCount: 8,
  },
  {
    id: "5",
    title: "Vintage Leather Sofa - Mid Century Modern",
    price: 450,
    description:
      "Beautiful mid-century modern leather sofa in cognac brown. Very sturdy, minor wear consistent with age. Dimensions: 84\" W x 32\" D x 30\" H.",
    category: "home",
    condition: "good",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
    ],
    seller: sellers[0],
    location: "New York, NY",
    createdAt: "2024-01-11",
    views: 213,
    isFeatured: false,
    tags: ["sofa", "furniture", "vintage", "leather"],
    rating: 4.6,
    reviewCount: 6,
  },
  {
    id: "6",
    title: "Trek FX3 Disc Hybrid Bike - 2023",
    price: 599,
    originalPrice: 849,
    description:
      "Trek FX3 Disc hybrid bike, size Medium. Used for one season, excellent condition. Hydraulic disc brakes, carbon fork. Perfect for commuting.",
    category: "sports",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop",
    ],
    seller: sellers[1],
    location: "San Francisco, CA",
    createdAt: "2024-01-10",
    views: 178,
    isFeatured: false,
    tags: ["trek", "bike", "cycling", "hybrid"],
    rating: 4.8,
    reviewCount: 15,
  },
  {
    id: "7",
    title: "Canon EOS R6 Mark II Camera Body",
    price: 1800,
    originalPrice: 2499,
    description:
      "Canon EOS R6 Mark II mirrorless camera body. Less than 5k shutter actuations. Full-frame, 40fps burst, incredible low-light performance.",
    category: "electronics",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
    ],
    seller: sellers[3],
    location: "Austin, TX",
    createdAt: "2024-01-09",
    views: 521,
    isFeatured: true,
    tags: ["canon", "camera", "mirrorless", "photography"],
    rating: 4.9,
    reviewCount: 31,
  },
  {
    id: "8",
    title: "Levi's 501 Original Jeans Bundle (5 pairs)",
    price: 120,
    description:
      "Bundle of 5 pairs of Levi's 501 original jeans, all size 32x32. Various washes. All in good condition with normal wear.",
    category: "fashion",
    condition: "good",
    images: [
      "https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=600&auto=format&fit=crop",
    ],
    seller: sellers[2],
    location: "Chicago, IL",
    createdAt: "2024-01-08",
    views: 143,
    isFeatured: false,
    tags: ["levis", "jeans", "denim", "bundle"],
    rating: 4.3,
    reviewCount: 7,
  },
  {
    id: "9",
    title: "iPad Pro 12.9\" M2 with Apple Pencil",
    price: 899,
    originalPrice: 1299,
    description:
      "iPad Pro 12.9-inch M2 256GB WiFi with Apple Pencil 2nd gen and Magic Keyboard. Perfect for art, note-taking, and productivity.",
    category: "electronics",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
    ],
    seller: sellers[0],
    location: "New York, NY",
    createdAt: "2024-01-07",
    views: 398,
    isFeatured: false,
    tags: ["ipad", "apple", "tablet", "pencil"],
    rating: 4.7,
    reviewCount: 19,
  },
  {
    id: "10",
    title: "Weber Spirit II E-310 Gas Grill",
    price: 350,
    originalPrice: 550,
    description:
      "Weber Spirit II E-310 3-burner gas grill. Used for 2 summers, well-maintained and cleaned. Includes grill cover and tool set.",
    category: "home",
    condition: "good",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
    ],
    seller: sellers[3],
    location: "Austin, TX",
    createdAt: "2024-01-06",
    views: 167,
    isFeatured: false,
    tags: ["weber", "grill", "bbq", "outdoor"],
    rating: 4.5,
    reviewCount: 9,
  },
  {
    id: "11",
    title: "PlayStation 5 Console + 3 Games",
    price: 450,
    description:
      "PS5 disc version with 3 games: Spider-Man 2, God of War Ragnarök, and The Last of Us Part I. All in excellent working condition.",
    category: "toys",
    condition: "good",
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop",
    ],
    seller: sellers[1],
    location: "San Francisco, CA",
    createdAt: "2024-01-05",
    views: 892,
    isFeatured: true,
    tags: ["ps5", "playstation", "gaming", "console"],
    rating: 4.8,
    reviewCount: 27,
  },
  {
    id: "12",
    title: "Dyson V15 Detect Cordless Vacuum",
    price: 380,
    originalPrice: 749,
    description:
      "Dyson V15 Detect vacuum cleaner. Used for 6 months, excellent suction. Includes all attachments and charging dock.",
    category: "home",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop",
    ],
    seller: sellers[2],
    location: "Chicago, IL",
    createdAt: "2024-01-04",
    views: 234,
    isFeatured: false,
    tags: ["dyson", "vacuum", "cordless", "home"],
    rating: 4.6,
    reviewCount: 13,
  },
];
