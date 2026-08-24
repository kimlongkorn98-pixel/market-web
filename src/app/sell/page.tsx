"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Plus,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { categories } from "@/lib/data";

const CONDITIONS = [
  { value: "new", label: "New", desc: "Brand new, never used" },
  { value: "like-new", label: "Like New", desc: "Used once or twice" },
  { value: "good", label: "Good", desc: "Normal wear, works great" },
  { value: "fair", label: "Fair", desc: "Heavy use, still functional" },
];

export default function SellPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "",
    condition: "",
    location: "",
    tags: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (form.title.length > 100) errs.title = "Title must be under 100 characters";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = "Enter a valid price";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.description.length < 20)
      errs.description = "Description must be at least 20 characters";
    if (!form.category) errs.category = "Select a category";
    if (!form.condition) errs.condition = "Select a condition";
    if (!form.location.trim()) errs.location = "Location is required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Listing Published! 🎉
        </h1>
        <p className="text-gray-500 mb-6">
          Your item <strong>"{form.title}"</strong> has been listed successfully.
          Buyers will be able to see it right away.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/profile"
            className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-2xl font-medium transition-colors"
          >
            My Listings
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                title: "",
                price: "",
                originalPrice: "",
                description: "",
                category: "",
                condition: "",
                location: "",
                tags: "",
              });
            }}
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-2xl font-medium transition-colors"
          >
            List Another Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">List an Item for Sale</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details below to create your listing. It's free!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo Upload (UI only) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">
            Photos <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  i === 0
                    ? "border-indigo-300 bg-indigo-50 text-indigo-400"
                    : "border-gray-200 text-gray-300 hover:border-gray-300"
                }`}
              >
                {i === 0 ? (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Add Photo</span>
                  </>
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Add up to 8 photos. First photo is your cover image.
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. iPhone 14 Pro Max 256GB Space Black"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                errors.title ? "border-red-300" : "border-gray-200"
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.title ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">
                {form.title.length}/100
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none bg-white ${
                  errors.category ? "border-red-300" : "border-gray-200"
                }`}
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
            {errors.category && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.category}
              </p>
            )}
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.value}
                  type="button"
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
            {errors.condition && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.condition}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
          <textarea
            placeholder="Describe your item in detail. Include brand, model, size, features, any defects, etc."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none ${
              errors.description ? "border-red-300" : "border-gray-200"
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400">
              {form.description.length} chars
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  className={`w-full pl-7 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.price ? "border-red-300" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.price}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price ($){" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.originalPrice}
                  onChange={(e) => update("originalPrice", e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Shows a discount badge
              </p>
            </div>
          </div>
        </div>

        {/* Location & Tags */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Location & Tags</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. New York, NY"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                errors.location ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.location && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.location}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. iphone, apple, smartphone (comma separated)"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-lg"
        >
          Publish Listing →
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
