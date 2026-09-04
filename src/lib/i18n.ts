import { create } from "zustand";
import { usePreferencesStore } from "./store";

export const translations = {
  en: {
    search_placeholder: "Search products, brands, and more...",
    sell: "Sell",
    filters: "Filters",
    all: "All",
    all_products: "All Products",
    listings_found: "listings found",
    clear_all: "Clear all",
    category: "Category",
    all_categories: "All Categories",
    condition: "Condition",
    price_range: "Price Range",
    min: "Min",
    max: "Max",
    no_products: "No products found",
    try_adjusting: "Try adjusting your filters or search terms.",
    clear_filters: "Clear Filters",
    results_for: "Results for",
    cat_electronics: "Electronics",
    cat_fashion: "Fashion",
    cat_home: "Home & Garden",
    cat_sports: "Sports",
    cat_vehicles: "Vehicles",
    cat_books: "Books",
    cat_toys: "Toys & Games",
    cat_beauty: "Beauty",
    cat_food: "Food & Drink",
    // Homepage
    hero_title1: "Buy & Sell Anything, ",
    hero_title2: "Anywhere",
    hero_subtitle: "Join millions of users buying and selling new and used items. Find amazing deals or list your items in minutes.",
    start_browsing: "Start Browsing",
    list_item: "List an Item",
    active_listings: "Active Listings",
    happy_buyers: "Happy Buyers",
    sellers_stat: "Sellers",
    avg_rating: "Average Rating",
    shop_by_category: "Shop by Category",
    view_all: "View all",
    featured_deals: "Featured Deals",
    see_all: "See all",
    recent_listings: "Recent Listings",
    browse_all: "Browse all",
  },
  km: {
    search_placeholder: "ស្វែងរកផលិតផល ម៉ាក...",
    sell: "លក់",
    filters: "តម្រង",
    all: "ទាំងអស់",
    all_products: "ផលិតផលទាំងអស់",
    listings_found: "ផលិតផលត្រូវបានរកឃើញ",
    clear_all: "សម្អាតទាំងអស់",
    category: "ប្រភេទ",
    all_categories: "ប្រភេទទាំងអស់",
    condition: "ស្ថានភាព",
    price_range: "តម្លៃ",
    min: "អប្បបរមា",
    max: "អតិបរមា",
    no_products: "រកមិនឃើញផលិតផលទេ",
    try_adjusting: "សាកល្បងកែតម្រូវតម្រងរបស់អ្នក។",
    clear_filters: "សម្អាតតម្រង",
    results_for: "លទ្ធផលសម្រាប់",
    cat_electronics: "គ្រឿងអេឡិចត្រូនិក",
    cat_fashion: "ម៉ូដសម្លៀកបំពាក់",
    cat_home: "ផ្ទះនិងសួនច្បារ",
    cat_sports: "កីឡា",
    cat_vehicles: "យានយន្ត",
    cat_books: "សៀវភៅ",
    cat_toys: "ប្រដាប់ក្មេងលេង",
    cat_beauty: "សម្រស់",
    cat_food: "អាហារនិងភេសជ្ជៈ",
    // Homepage
    hero_title1: "ទិញនិងលក់អ្វីក៏បាន ",
    hero_title2: "គ្រប់ទីកន្លែង",
    hero_subtitle: "ចូលរួមជាមួយអ្នកប្រើប្រាស់រាប់លាននាក់ក្នុងការទិញនិងលក់ទំនិញថ្មីនិងមួយទឹក។",
    start_browsing: "ចាប់ផ្តើមរុករក",
    list_item: "ដាក់លក់ទំនិញ",
    active_listings: "ទំនិញកំពុងលក់",
    happy_buyers: "អ្នកទិញរីករាយ",
    sellers_stat: "អ្នកលក់",
    avg_rating: "ការវាយតម្លៃមធ្យម",
    shop_by_category: "ទិញតាមប្រភេទ",
    view_all: "មើលទាំងអស់",
    featured_deals: "កិច្ចព្រមព្រៀងពិសេស",
    see_all: "មើលទាំងអស់",
    recent_listings: "បញ្ជីថ្មីៗ",
    browse_all: "រុករកទាំងអស់",
  },
  vi: {
    search_placeholder: "Tìm kiếm sản phẩm, thương hiệu...",
    sell: "Bán",
    filters: "Bộ lọc",
    all: "Tất cả",
    all_products: "Tất cả sản phẩm",
    listings_found: "sản phẩm được tìm thấy",
    clear_all: "Xóa tất cả",
    category: "Danh mục",
    all_categories: "Tất cả danh mục",
    condition: "Tình trạng",
    price_range: "Khoảng giá",
    min: "Tối thiểu",
    max: "Tối đa",
    no_products: "Không tìm thấy sản phẩm",
    try_adjusting: "Hãy thử điều chỉnh bộ lọc của bạn.",
    clear_filters: "Xóa bộ lọc",
    results_for: "Kết quả cho",
    cat_electronics: "Điện tử",
    cat_fashion: "Thời trang",
    cat_home: "Nhà & Vườn",
    cat_sports: "Thể thao",
    cat_vehicles: "Xe cộ",
    cat_books: "Sách",
    cat_toys: "Đồ chơi",
    cat_beauty: "Làm đẹp",
    cat_food: "Thực phẩm & Đồ uống",
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const language = usePreferencesStore((state) => state.language) as Language;
  
  const t = (key: TranslationKey | string) => {
    const langDict = translations[language] || translations.en;
    // Fallback to English if key doesn't exist in current language
    const text = langDict[key as TranslationKey] || translations.en[key as TranslationKey];
    return text || key; // If key is completely unknown, return the key string
  };

  return { t, language };
}
