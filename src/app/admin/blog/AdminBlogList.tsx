"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteArticle } from "@/app/admin/blog/actions";
import type { AdminArticleRow } from "@/lib/queries/articles";
import { formatArticleDate } from "@/lib/articles";

export function AdminBlogList({
  articles,
}: {
  articles: AdminArticleRow[];
}) {
  const router = useRouter();

  async function handleDelete(article: AdminArticleRow) {
    const confirmed = window.confirm(
      `Da li ste sigurni da želite da obrišete članak "${article.title}"? Ova radnja je trajna.`,
    );
    if (!confirmed) return;

    const res = await deleteArticle(article.id);
    if (!res.ok) {
      alert(res.error ?? "Greška pri brisanju.");
      return;
    }
    router.refresh();
  }

  if (articles.length === 0) {
    return (
      <p className="mt-6 text-sm text-[var(--ar-gray-600)]">
        Nema članaka za prikaz.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {articles.map((article) => (
        <div
          key={article.id}
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-[var(--ar-gray-900)]">
                {article.title}
              </p>
              <Link
                href={article.section === "saveti" ? `/saveti/${article.slug}` : `/blog/${article.slug}`}
                className="text-sm text-[var(--ar-primary)] hover:underline"
              >
                /{article.section}/{article.slug}
              </Link>
              <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
                {article.section === "saveti" ? "Saveti" : "Blog"}
                {article.category && ` • ${article.category}`} • Status: {article.status} •{" "}
                {formatArticleDate(article.published_at)}
              </p>
            </div>
            <span className="text-sm text-[var(--ar-gray-600)]">
              {new Date(article.updated_at).toLocaleString("sr-RS")}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              href={`/admin/blog/${article.id}/izmeni`}
              className="cursor-pointer rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-50)]"
            >
              Izmeni
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(article)}
              className="cursor-pointer rounded-none border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Obriši
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
