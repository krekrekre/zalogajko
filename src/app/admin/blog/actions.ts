"use server";

import { isAdmin } from "@/lib/admin";
import {
  createArticle as dbCreateArticle,
  updateArticle as dbUpdateArticle,
  deleteArticle as dbDeleteArticle,
} from "@/lib/queries/articles";
import { revalidatePath } from "next/cache";

export type ArticleFormData = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  image_url: string;
  category: string;
  section: "blog" | "saveti";
  status: "draft" | "published";
};

export async function createArticle(
  data: ArticleFormData
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, error: "Nemate pravo da dodajete članke." };

  const result = await dbCreateArticle({
    slug: data.slug.trim(),
    title: data.title.trim(),
    excerpt: data.excerpt.trim(),
    content: data.content.trim(),
    published_at: data.published_at || new Date().toISOString(),
    image_url: data.image_url?.trim() || null,
    category: data.category?.trim() || null,
    section: data.section,
    status: data.status,
  });

  if ("error" in result) return { ok: false, error: result.error };
  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true, id: result.id };
}

export async function updateArticle(
  id: string,
  data: ArticleFormData
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, error: "Nemate pravo da menjate članke." };

  const { error } = await dbUpdateArticle(id, {
    slug: data.slug.trim(),
    title: data.title.trim(),
    excerpt: data.excerpt.trim(),
    content: data.content.trim(),
    published_at: data.published_at || undefined,
    image_url: data.image_url?.trim() || null,
    category: data.category?.trim() || null,
    section: data.section,
    status: data.status,
  });

  if (error) return { ok: false, error };
  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/saveti");
  revalidatePath(`/blog/${data.slug.trim()}`);
  revalidatePath(`/saveti/${data.slug.trim()}`);
  return { ok: true };
}

export async function deleteArticle(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, error: "Nemate pravo da brišete članke." };

  const { error } = await dbDeleteArticle(id);
  if (error) return { ok: false, error };
  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/saveti");
  return { ok: true };
}
