"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Lock,
} from "lucide-react";
import { categories, type Condition, type Product } from "@/lib/data";
import { ApiError, createProduct } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useProductStore } from "@/lib/product-store";
import ProductImage from "@/components/ProductImage";

const CONDITIONS: { value: Condition; label: string; desc: string }[] = [
  { value: "new", label: "New", desc: "Brand new, never used" },
  { value: "like-new", label: "Like New", desc: "Used once or twice" },
  { value: "good", label: "Good", desc: "Normal wear, works great" },
  { value: "fair", label: "Fair", desc: "Heavy use, still functional" },
];

const EMPTY_FORM = {
  title: "",
  price: "",
  originalPrice: "",
  description: "",
  category: "",
  condition: "",
  location: "",
  imageUrl: "",
};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3" /> {error}
    </p>
  );
}

export default function SellPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const addProduct = useProductStore((s) => s.addProduct);

  // Auth state lives in localStorage, so only trust it after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [created, setCreated] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (form.title.length > 100) errs.title = "Title must be under 100 characters";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = "Enter a valid price";
    if (form.originalPrice && Number(form.originalPrice) <= Number(form.price))
      errs.originalPrice = "Original price should be higher than the selling price";
    if (form.description.trim().length < 20)
      errs.description = "Description must be at least 20 characters";
    if (form.description.length > 500)
      errs.description = "Description must be under 500 characters";
    if (!form.category) errs.category = "Select a category";
    if (!form.condition) errs.condition = "Select a condition";
    if (!form.location.trim()) errs.location = "Location is required";
    if (form.imageUrl && !/^https?:\/\/\S+$/i.test(form.imageUrl.trim()))
      errs.imageUrl = "Enter a full image link starting with http:// or https://";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    if (!accessToken) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const product = await createProduct(
        {
          title: form.title,
          description: form.description,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          category: form.category,
          condition: form.condition as Condition,
          location: form.location,
          imageUrl: form.imageUrl,
        },
        accessToken
      );
      addProduct(product);
      setCreated(product);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Token expired or invalid: make the user sign in again.
        signOut();
        router.push("/login");
        return;
      }
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to sell</h1>
        <p className="text-gray-500 mb-6">
          You need an account to publish a listing. It only takes a minute.
        </p>
        <Link
          href="/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
        >
          Sign in or create account
        </Link>
      </div>
    );
  }

  if (created) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Listing Published! 🎉
        </h1>
        <p className="text-gray-500 mb-6">
          Your item <strong>&ldquo;{created.title}&rdquo;</strong> is live. Buyers
          can see it right away on the web and in the mobile app.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href={`/products/${created.id}`}
            className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-2xl font-medium transition-colors"
          >
            View Listing
          </Link>
          <Link
            href="/profile"
            className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-2xl font-medium transition-colors"
          >
            My Listings
          </Link>
          <button
            onClick={() => {
              setCreated(null);
              setForm(EMPTY_FORM);
            }}
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-2xl font-medium transition-colors"
          >
            List Another Item
          </button>
        </div>
      </div>
    );
  }

  const inputClass = (key: string) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white ${
      errors[key] ? "border-red-300" : "border-gray-200"
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">List an Item for Sale</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details below to create your listing. It&apos;s free!
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Photo */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">
            Photo <span className="text-gray-400 font-normal text-sm">(optional)</span>
          </h2>
          <div className="flex gap-4 items-start">
            <ProductImage
              src={!errors.imageUrl && form.imageUrl.trim() ? form.imageUrl.trim() : undefined}
              alt="Listing photo preview"
              className="w-24 h-24 shrink-0 rounded-xl border border-gray-100"
            />
            <div className="flex-1">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image link
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://…/photo.jpg"
                  value={form.imageUrl}
                  onChange={(e) => update("imageUrl", e.target.value)}
                  className={`${inputClass("imageUrl")} pl-9`}
                />
              </div>
              <FieldError error={errors.imageUrl} />
              <p className="text-xs text-gray-400 mt-1">
                Paste a link to a photo of your item.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. iPhone 14 Pro Max 256GB Space Black"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass("title")}
            />
            <div className="flex justify-between">
              <FieldError error={errors.title} />
              <span className="text-xs text-gray-400 mt-1 ml-auto">
                {form.title.length}/100
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={`${inputClass("category")} appearance-none`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <FieldError error={errors.category} />
          </div>

          {/* Condition */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Condition <span className="text-red-500">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.value}
                  type="button"
                  aria-pressed={form.condition === cond.value}
                  onClick={() => update("condition", cond.value)}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    form.condition === cond.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {cond.label}
                  </div>
                  <div className="text-xs text-gray-500">{cond.desc}</div>
                </button>
              ))}
            </div>
            <FieldError error={errors.condition} />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <label htmlFor="description" className="block font-semibold text-gray-900 mb-3">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            placeholder="Describe your item in detail. Include brand, model, size, features, any defects, etc."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            className={`${inputClass("description")} resize-none`}
          />
          <div className="flex justify-between">
            <FieldError error={errors.description} />
            <span className="text-xs text-gray-400 mt-1 ml-auto">
              {form.description.length}/500
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  className={`${inputClass("price")} pl-7`}
                />
              </div>
              <FieldError error={errors.price} />
            </div>
            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Original Price ($){" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.originalPrice}
                  onChange={(e) => update("originalPrice", e.target.value)}
                  className={`${inputClass("originalPrice")} pl-7`}
                />
              </div>
              {errors.originalPrice ? (
                <FieldError error={errors.originalPrice} />
              ) : (
                <p className="text-xs text-gray-400 mt-1">Shows a discount badge</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <label htmlFor="location" className="block font-semibold text-gray-900 mb-3">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g. Phnom Penh"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className={inputClass("location")}
          />
          <FieldError error={errors.location} />
        </div>

        {submitError && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-3 py-2.5 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-lg"
        >
          {submitting ? "Publishing…" : "Publish Listing →"}
        </button>
        <p className="text-center text-xs text-gray-400">
          By listing, you agree to our{" "}
          <a href="#" className="underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline">
            Selling Policy
          </a>
          .
        </p>
      </form>
    </div>
  );
}
