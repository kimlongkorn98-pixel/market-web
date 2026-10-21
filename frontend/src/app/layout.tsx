import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeSync from "@/components/ThemeSync";
import AuthSync from "@/components/AuthSync";

export const metadata: Metadata = {
  title: "MarketHub — Buy & Sell Anything",
  description:
    "The best marketplace to buy and sell new and used items. Find great deals or list your items today.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 antialiased">
        <ThemeSync />
        <AuthSync />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
