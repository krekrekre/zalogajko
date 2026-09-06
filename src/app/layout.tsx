import type { Metadata } from "next";
import { Capriola, DynaPuff, Playpen_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { SiteSchema } from "@/components/SiteSchema";
import { ALLOW_INDEXING, DEFAULT_META } from "@/lib/constants";
import { getFilterCategories } from "@/lib/queries/recipes";

const capriola = Capriola({
  variable: "--font-capriola",
  subsets: ["latin"],
  weight: ["400"],
});

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
  ...(ALLOW_INDEXING ? {} : { robots: { index: false, follow: false } }),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getFilterCategories();

  const sastojciDropdownItems = [
    "Piletina",
    "Govedina",
    "Svinjetina",
    "Pasta",
    "Voće",
    "Povrće",
  ];

  return (
    <html lang="sr">
      <body className={`${capriola.variable} ${dynaPuff.variable} ${playpenSans.variable} ${playpenSans.className} font-sans antialiased bg-white`}>
        <SiteSchema />
        <AppShell categories={categories} ingredients={sastojciDropdownItems}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
