"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createArticle, updateArticle } from "@/app/admin/blog/actions";
import type { ArticleFormData } from "@/app/admin/blog/actions";

const STORAGE_BUCKET = "recipe-images";
const ARTICLES_FOLDER = "articles";

type ArticleFormProps = {
  initial?: Partial<ArticleFormData>;
  action: "create" | "edit";
  articleId?: string;
  submitLabel: string;
};

function toLocalDatetime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/š/g, "s")
    .replace(/č|ć/g, "c")
    .replace(/đ/g, "d")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ArticleForm({
  initial,
  action,
  articleId,
  submitLabel,
}: ArticleFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [publishedAt, setPublishedAt] = useState(
    initial?.published_at ? toLocalDatetime(initial.published_at) : toLocalDatetime(new Date().toISOString())
  );
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(initial?.category ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    (initial?.status as "draft" | "published") ?? "draft"
  );
  const [section, setSection] = useState<"blog" | "saveti">(
    (initial?.section as "blog" | "saveti") ?? "blog"
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Izaberite sliku (JPG, PNG, WebP ili GIF).");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadError(null);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (action === "create" && !initial?.slug) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploadError(null);

    let finalImageUrl = imageUrl.trim();
    if (imageFile) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Morate biti prijavljeni da biste otpremili sliku.");
        return;
      }
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
      const path = `${user.id}/${ARTICLES_FOLDER}/${slug.trim() || "article"}-${Date.now()}.${safeExt}`;
      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, imageFile, { upsert: true, cacheControl: "3600" });
      if (uploadErr) {
        setUploadError(`Slika nije učitana: ${uploadErr.message}`);
        return;
      }
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      finalImageUrl = urlData.publicUrl;
    }

    const iso =
      publishedAt && publishedAt.length >= 16
        ? new Date(publishedAt).toISOString()
        : new Date().toISOString();
    const data: ArticleFormData = {
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      published_at: iso,
      image_url: finalImageUrl,
      category: category.trim(),
      section,
      status,
    };
    const result =
      action === "create"
        ? await createArticle(data)
        : await updateArticle(articleId!, data);
    if (result.ok) {
      if (action === "create" && result.id) {
        router.push(`/admin/blog/${result.id}/izmeni`);
        router.refresh();
      } else {
        router.refresh();
      }
    } else {
      setError(result.error ?? "Greška pri čuvanju.");
    }
  };

  const inputClass =
    "w-full border border-[var(--ar-gray-300)] bg-white px-3 py-2 text-sm text-[var(--ar-gray-900)] outline-none focus:border-[var(--ar-primary)]";
  const labelClass = "block text-sm font-medium text-[var(--ar-gray-700)]";

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
      {error && (
        <p className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="title" className={labelClass}>
          Naslov *
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug (URL) *
        </label>
        <input
          id="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputClass}
          placeholder="npr. moj-naslov-clanka"
        />
      </div>
      <div>
        <label htmlFor="excerpt" className={labelClass}>
          Kratak opis (izvod) *
        </label>
        <textarea
          id="excerpt"
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="content" className={labelClass}>
          Sadržaj (HTML) *
        </label>
        <textarea
          id="content"
          required
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${inputClass} font-mono text-xs`}
          placeholder="<p>Paragraf...</p>&#10;<h2>Podnaslov</h2>&#10;<p>...</p>"
        />
        <p className="mt-1 text-xs text-[var(--ar-gray-500)]">
          Možete koristiti HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, itd.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="published_at" className={labelClass}>
            Datum objave
          </label>
          <input
            id="published_at"
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className={inputClass}
          >
            <option value="draft">Nacrt</option>
            <option value="published">Objavljeno</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="section" className={labelClass}>
          Stranica
        </label>
        <select
          id="section"
          value={section}
          onChange={(e) => setSection(e.target.value as "blog" | "saveti")}
          className={inputClass}
        >
          <option value="blog">Blog (/blog)</option>
          <option value="saveti">Saveti (/saveti)</option>
        </select>
        <p className="mt-1 text-xs text-[var(--ar-gray-500)]">
          Na kojoj stranici će se članak prikazati.
        </p>
      </div>
      <div>
        <label htmlFor="article_image" className={labelClass}>
          Slika članka
        </label>
        {(imagePreview || imageUrl) && (
          <div className="relative mt-2 inline-block">
            <div className="relative h-32 w-48 overflow-hidden rounded-none border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Pregled"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              )}
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Ukloni sliku
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          id="article_image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          className="mt-2 block w-full text-sm text-[var(--ar-gray-600)] file:mr-2 file:rounded-none file:border-0 file:bg-[var(--ar-primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:hover:bg-[var(--ar-primary-hover)]"
        />
        {uploadError && (
          <p className="mt-1 text-sm text-red-600">{uploadError}</p>
        )}
        <p className="mt-1 text-xs text-[var(--ar-gray-500)]">
          JPG, PNG, WebP ili GIF. Ako ne izaberete novu sliku, postojeća ostaje.
        </p>
      </div>
      <div>
        <label htmlFor="category" className={labelClass}>
          Kategorija
        </label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
          placeholder="npr. Kultura, Sezona, Saveti"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="cursor-pointer rounded-none bg-[var(--ar-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)]"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="cursor-pointer rounded-none border border-[var(--ar-gray-300)] bg-white px-4 py-2 text-sm font-medium text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-50)]"
        >
          Odustani
        </button>
      </div>
    </form>
  );
}
