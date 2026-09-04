"use client";

import { Check, Languages, Moon, Settings, Sun } from "lucide-react";
import {
  type LanguagePreference,
  type ThemePreference,
  usePreferencesStore,
} from "@/lib/store";

const THEMES: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Light", description: "Use a bright background", icon: Sun },
  { value: "dark", label: "Dark", description: "Use a dark background", icon: Moon },
];

const LANGUAGES: Array<{
  value: LanguagePreference;
  label: string;
  nativeLabel: string;
  flag: string;
}> = [
  { value: "km", label: "Khmer", nativeLabel: "ខ្មែរ", flag: "🇰🇭" },
  { value: "en", label: "English", nativeLabel: "English", flag: "🇺🇸" },
  { value: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", flag: "🇻🇳" },
];

export default function SettingsPage() {
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Customize your MarketHub experience</p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="font-semibold text-gray-900">Appearance</h2>
              <p className="text-sm text-gray-500">Choose how the site looks on this device.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map((option) => {
              const Icon = option.icon;
              const selected = theme === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  aria-pressed={selected}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    selected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${selected ? "text-indigo-600" : "text-gray-500"}`} />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-gray-900">{option.label}</span>
                    <span className="block text-xs text-gray-500">{option.description}</span>
                  </span>
                  {selected && <Check className="w-5 h-5 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="font-semibold text-gray-900">Language</h2>
              <p className="text-sm text-gray-500">Select your preferred language.</p>
            </div>
          </div>
          <div className="space-y-2">
            {LANGUAGES.map((option) => {
              const selected = language === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setLanguage(option.value)}
                  aria-pressed={selected}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{option.flag}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-gray-900">{option.label}</span>
                    <span className="block text-xs text-gray-500">{option.nativeLabel}</span>
                  </span>
                  {selected && <Check className="w-5 h-5 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
