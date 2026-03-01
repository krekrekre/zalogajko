import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_META } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = DEFAULT_META.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/recepti`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/saveti`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/kategorije`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  let recipePages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];
  let articlePages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id, slug, updated_at")
      .eq("status", "published");
    if (recipes?.length) {
      const recipeIds = recipes.map((r) => r.id);
      const { data: rcData } = await supabase
        .from("recipe_categories")
        .select("recipe_id, category:categories(slug)")
        .in("recipe_id", recipeIds);
      const idToFirstCategory: Record<string, string> = {};
      for (const rc of rcData || []) {
        const raw = rc as unknown as { recipe_id: string; category?: { slug: string } | { slug: string }[] };
        const cat = Array.isArray(raw.category) ? raw.category[0] : raw.category;
        const slug = cat?.slug;
        if (slug && !idToFirstCategory[raw.recipe_id]) idToFirstCategory[raw.recipe_id] = slug;
      }
      recipePages = recipes.map((r) => {
        const categorySlug = idToFirstCategory[r.id] ?? "ostalo";
        return {
          url: `${baseUrl}/recepti/${categorySlug}/${r.slug}`,
          lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });
    }

    const { data: categories } = await supabase
      .from("categories")
      .select("slug");
    categoryPages = (categories || []).map((c) => ({
      url: `${baseUrl}/recepti/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const { data: articles } = await supabase
      .from("articles")
      .select("slug, section, updated_at")
      .eq("status", "published");
    articlePages = (articles || []).map((a) => ({
      url: `${baseUrl}/${a.section ?? "blog"}/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Supabase not configured
  }

  return [...staticPages, ...recipePages, ...categoryPages, ...articlePages];
}
