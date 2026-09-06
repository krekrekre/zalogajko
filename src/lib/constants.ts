// Site constants — Serbian market

export const SITE_NAME = "Recepti";

// Stock image placeholders for recipes without images (Unsplash - free to use)
export const PLACEHOLDER_IMAGES = {
  generic:
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80",
  mainDish:
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  dessert: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80",
  default:
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80",
} as const;

// Default user avatar when no custom image (animal placeholder)
export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&q=80";
export const SITE_DESCRIPTION =
  "Vodič kroz recepte za domaće kuvare. Pronađite proverene recepte, sačuvajte omiljene i delite sa zajednicom.";

export const TRUST_BADGE = "Pouzdan vodič kroz recepte za domaće kuvare";

// Social proof stats (placeholder - can be wired to DB counts)
export const STATS = {
  recipes: "Recepti",
  ratings: "Ocena",
  cooks: "Domaćih kuvara",
};

// Popular searches for homepage (Serbian cuisine)
// category: true = link to /recepti/{slug}, else link to /sastojci/{slug}
export const POPULAR_SEARCHES = [
  { label: "Piletina", slug: "piletina" },
  { label: "Govedina", slug: "govedina" },
  { label: "Svinjetina", slug: "svinjetina" },
  { label: "Pasta", slug: "pasta" },
  { label: "Voće", slug: "voce" },
  { label: "Povrće", slug: "povrce" },
  { label: "Glavna jela", slug: "glavna-jela", category: true },
  { label: "Kolači", slug: "kolaci", category: true },
] as const;

/**
 * Search engines are let in unless NEXT_PUBLIC_ALLOW_INDEXING is exactly "false".
 * Opt-out rather than opt-in on purpose: forgetting to set it leaves the site
 * indexable (recoverable), whereas an opt-in default would silently keep a
 * launched site out of Google until someone noticed.
 */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false";

export const DEFAULT_META = {
  title: `${SITE_NAME} | Recepti, saveti i više`,
  description: SITE_DESCRIPTION,
  locale: "sr_RS" as const,
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://recepti.rs",
};
