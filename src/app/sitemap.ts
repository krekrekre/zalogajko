import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_META } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = DEFAULT_META.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/recepti`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/kategorije`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  let recipePages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();
    const { data: recipes } = await supabase
      .from("recipes")
      .select("slug, updated_at")
      .eq("status", "published");
    recipePages = (recipes || []).map((r) => ({
      url: `${baseUrl}/recepti/${r.slug}`,
      lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const { data: categories } = await supabase
      .from("categories")
      .select("slug");
    categoryPages = (categories || []).map((c) => ({
      url: `${baseUrl}/kategorija/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Supabase not configured
  }

  return [...staticPages, ...recipePages, ...categoryPages];
}
