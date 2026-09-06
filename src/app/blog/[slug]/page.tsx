import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getArticleBySlug,
  getRelatedArticles,
  formatArticleDate,
  BLOG_ARTICLES,
} from "@/lib/articles";
import { getListingMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/articles/ArticleCard";
import {
  getPublishedArticles,
  getPublishedBlogArticleBySlug,
  getRelatedBlogArticles,
} from "@/lib/queries/articles";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";

// Public, read-only page: serve from cache and refresh in the background.
export const revalidate = 3600;
export async function generateStaticParams() {
  const fromDb = await getPublishedArticles("blog");
  const slugs = new Set([
    ...fromDb.map((a) => a.slug),
    ...BLOG_ARTICLES.map((a) => a.slug),
  ]);
  return [...slugs].map((slug) => ({ slug }));
}


const PLACEHOLDER_ARTICLE =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fromDb = await getPublishedBlogArticleBySlug(slug);
  const article = fromDb ?? getArticleBySlug(slug, "blog");
  if (!article) return {};
  return getListingMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const fromDb = await getPublishedBlogArticleBySlug(slug);
  const article = fromDb ?? getArticleBySlug(slug, "blog");
  if (!article) notFound();
  const articleHtml = sanitizeArticleHtml(article.content.trim());

  const relatedFromDb = await getRelatedBlogArticles(slug, 4);
  const related =
    relatedFromDb.length > 0
      ? relatedFromDb
      : getRelatedArticles(slug, "blog", 4);
  const imageUrl = article.imageUrl || PLACEHOLDER_ARTICLE;

  const breadcrumbItems = [
    { name: "Blog", path: "/blog" },
    { name: article.title, path: `/blog/${article.slug}` },
  ];

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="mx-auto max-w-[1060px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:gap-[96px] lg:[grid-template-columns:600px_300px]">
          <article className="min-w-0 bg-[#ffffff] py-8 sm:py-10">
            <nav
              className="text-xs uppercase tracking-wide text-[var(--ar-gray-700)] sm:text-sm"
              aria-label="Breadcrumb"
            >
              {breadcrumbItems.map((item, i) => (
                <span key={i}>
                  {i > 0 && (
                    <span className="mx-2 text-[var(--ar-gray-400)]">&gt;</span>
                  )}
                  {i === breadcrumbItems.length - 1 ? (
                    <span
                      className="text-[var(--ar-gray-700)]"
                      aria-current="page"
                    >
                      {item.name}
                    </span>
                  ) : (
                    <Link href={item.path} className="hover:underline">
                      {item.name}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            {article.category && (
              <span className="mt-3 inline-block rounded-none border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)] px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--ar-gray-600)]">
                {article.category}
              </span>
            )}
            <h1 className="mt-3 font-capriola text-3xl font-bold leading-tight text-[var(--ar-gray-900)] sm:text-4xl lg:text-[46px]">
              {article.title}
            </h1>
            <time
              dateTime={article.publishedAt}
              className="mt-2 block text-sm text-[var(--ar-gray-500)]"
            >
              {formatArticleDate(article.publishedAt)}
            </time>

            <div className="relative mt-6 aspect-[4/3] overflow-hidden shadow-[var(--ar-card-shadow)]">
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1060px) 100vw, 600px"
                priority
              />
            </div>

            <div
              className="article-body mt-8 border-t border-[var(--ar-gray-200)] pt-8"
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />

            <div className="mt-10 border-t border-[var(--ar-gray-200)] pt-6">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--ar-primary-hover)] hover:underline"
              >
                ← Nazad na blog
              </Link>
            </div>
          </article>

          <aside className="hidden min-w-0 lg:block" aria-label="Reklame">
            <div className="sticky top-8 flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-[var(--ar-gray-300)] bg-[var(--ar-gray-50)] text-sm text-[var(--ar-gray-500)]">
              Reklama (300×250)
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-8 w-full bg-[#f1f1e6] py-10 sm:py-12">
          <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-[var(--ar-gray-700)]">
              Pročitajte još
            </h2>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} basePath="/blog" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
