import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/articles";

function rowToArticle(row: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  image_url: string | null;
  category: string | null;
}): Article {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    publishedAt: row.published_at,
    imageUrl: row.image_url ?? undefined,
    category: row.category ?? undefined,
  };
}

/** Public: published articles for a section (blog or saveti). */
export async function getPublishedArticles(
  section: "blog" | "saveti"
): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, excerpt, content, published_at, image_url, category")
    .eq("status", "published")
    .eq("section", section)
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToArticle);
}

/** Public: single article by slug in a section (published only). */
export async function getPublishedArticleBySlug(
  section: "blog" | "saveti",
  slug: string
): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, excerpt, content, published_at, image_url, category")
    .eq("section", section)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return rowToArticle(data);
}

/** Public: related articles in the same section (excluding current slug). */
export async function getRelatedArticles(
  section: "blog" | "saveti",
  currentSlug: string,
  limit: number
): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, excerpt, content, published_at, image_url, category")
    .eq("status", "published")
    .eq("section", section)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(rowToArticle);
}

/** @deprecated Use getPublishedArticles('blog') */
export async function getPublishedBlogArticles(): Promise<Article[]> {
  return getPublishedArticles("blog");
}

/** @deprecated Use getPublishedArticleBySlug('blog', slug) */
export async function getPublishedBlogArticleBySlug(
  slug: string
): Promise<Article | null> {
  return getPublishedArticleBySlug("blog", slug);
}

/** @deprecated Use getRelatedArticles('blog', slug, limit) */
export async function getRelatedBlogArticles(
  currentSlug: string,
  limit: number
): Promise<Article[]> {
  return getRelatedArticles("blog", currentSlug, limit);
}

export type AdminArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  image_url: string | null;
  category: string | null;
  section: string;
  status: string;
  created_at: string;
  updated_at: string;
};

/** Admin: list all articles with optional status/section filter. */
export async function getAdminArticles(options?: {
  status?: "draft" | "published" | "all";
  section?: "blog" | "saveti" | "all";
  q?: string;
}): Promise<AdminArticleRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select("id, slug, title, excerpt, content, published_at, image_url, category, section, status, created_at, updated_at")
    .order("published_at", { ascending: false });

  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }
  if (options?.section && options.section !== "all") {
    query = query.eq("section", options.section);
  }
  if (options?.q?.trim()) {
    const term = `%${options.q.trim().replace(/,/g, " ")}%`;
    query = query.or(
      `title.ilike.${term},slug.ilike.${term},excerpt.ilike.${term},category.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as AdminArticleRow[];
}

/** Admin: get one article by id. */
export async function getAdminArticleById(
  id: string
): Promise<AdminArticleRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content, published_at, image_url, category, section, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminArticleRow;
}

/** Admin: create article. Caller must enforce isAdmin(). */
export async function createArticle(insert: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  image_url?: string | null;
  category?: string | null;
  section: "blog" | "saveti";
  status: "draft" | "published";
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .insert({
      slug: insert.slug,
      title: insert.title,
      excerpt: insert.excerpt,
      content: insert.content,
      published_at: insert.published_at,
      image_url: insert.image_url ?? null,
      category: insert.category || null,
      section: insert.section,
      status: insert.status,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  if (!data?.id) return { error: "Nije moguće kreirati članak." };
  return { id: data.id };
}

/** Admin: update article. Caller must enforce isAdmin(). */
export async function updateArticle(
  id: string,
  update: {
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    published_at?: string;
    image_url?: string | null;
    category?: string | null;
    section?: "blog" | "saveti";
    status?: "draft" | "published";
  }
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { error: error?.message ?? null };
}

/** Admin: delete article. Caller must enforce isAdmin(). */
export async function deleteArticle(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  return { error: error?.message ?? null };
}
