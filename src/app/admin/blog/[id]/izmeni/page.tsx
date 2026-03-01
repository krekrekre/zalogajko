import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminArticleById } from "@/lib/queries/articles";
import { ArticleForm } from "../../ArticleForm";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const article = await getAdminArticleById(id);
  return {
    title: article ? `Izmena: ${article.title} | Admin Blog` : "Admin Blog",
  };
}

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params;
  const article = await getAdminArticleById(id);
  if (!article) notFound();

  return (
    <div>
      <Link
        href="/admin/blog"
        className="text-sm text-[var(--ar-primary)] hover:underline"
      >
        ← Nazad na blog
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-[var(--ar-gray-900)]">
        Izmena: {article.title}
      </h1>
      <ArticleForm
        initial={{
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          published_at: article.published_at,
          image_url: article.image_url ?? "",
          category: article.category ?? "",
          section: (article.section as "blog" | "saveti") ?? "blog",
          status: article.status as "draft" | "published",
        }}
        action="edit"
        articleId={id}
        submitLabel="Sačuvaj izmene"
      />
    </div>
  );
}
