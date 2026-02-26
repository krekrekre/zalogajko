import type { Metadata } from "next";
import { DynaPuff, Playpen_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DEFAULT_META } from "@/lib/constants";
import { getFilterCategories, getDistinctIngredients } from "@/lib/queries/recipes";

const dynaPuff = DynaPuff({
  variable: "--font-dynapuff",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playpenSans = Playpen_Sans({
  variable: "--font-playpen-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: DEFAULT_META.title,
  description: DEFAULT_META.description,
  metadataBase: new URL(DEFAULT_META.url),
  openGraph: {
    locale: DEFAULT_META.locale,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, ingredients] = await Promise.all([
    getFilterCategories(),
    getDistinctIngredients(),
  ]);

  return (
    <html lang="sr">
      <body className={`${dynaPuff.variable} ${playpenSans.variable} ${playpenSans.className} font-sans antialiased bg-white`}>
        <div className="flex min-h-screen flex-col bg-white">
          <Header categories={categories} ingredients={ingredients} />
          <main className="flex-1 bg-white">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
