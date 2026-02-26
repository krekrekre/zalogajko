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
export const POPULAR_SEARCHES = [
  { label: "Čorba", slug: "corba" },
  { label: "Piletina", slug: "piletina" },
  { label: "Gibanica", slug: "gibanica" },
  { label: "Karadjordjeva", slug: "karadjordjeva" },
  { label: "Sarma", slug: "sarma" },
  { label: "Punjene paprike", slug: "punjene-paprike" },
  { label: "Palačinke", slug: "palacinke" },
  { label: "Kolači", slug: "kolaci" },
  { label: "Salate", slug: "salate" },
  { label: "Kuvana jela", slug: "kuvana-jela" },
] as const;

export const DEFAULT_META = {
  title: `${SITE_NAME} | Recepti, saveti i više`,
  description: SITE_DESCRIPTION,
  locale: "sr_RS" as const,
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://recepti.rs",
};
