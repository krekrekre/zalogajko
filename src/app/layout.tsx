import type { Metadata } from "next";
import { Bricolage_Grotesque, Nunito_Sans, Playpen_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { SiteSchema } from "@/components/SiteSchema";
import { ALLOW_INDEXING, DEFAULT_META } from "@/lib/constants";
import { getFilterCategories } from "@/lib/queries/recipes";

// Three roles, not three decorations. Display carries the headings, body
// carries everything you actually read, and the handwriting face is an accent
// -- it was the body font, which made a 7-step method hard work to follow.
// latin-ext is explicit because Serbian needs č ć š ž đ.
const bricolageDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const nunitoBody = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const playpenAccent = Playpen_Sans({
  variable: "--font-accent",
  subsets: ["latin", "latin-ext"],
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
    <html lang="sr" data-scroll-behavior="smooth">
      <body className={`${bricolageDisplay.variable} ${nunitoBody.variable} ${playpenAccent.variable} ${nunitoBody.className} font-sans antialiased bg-white`}>
        <SiteSchema />
        <AppShell categories={categories} ingredients={sastojciDropdownItems}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
