"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/lib/store";

export default function ThemeSync() {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return null;
}
