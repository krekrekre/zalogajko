import Link from "next/link";
import { BLOG_ARTICLES } from "@/lib/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";

const FEATURED_COUNT = 3;

export function BlogSection() {
  const articles = BLOG_ARTICLES.slice(0, FEATURED_COUNT);

  return (
    <section className="border-b border-[var(--ar-gray-200)] bg-white py-12">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-[30px] font-bold text-[var(--ar-gray-700)]">
          Iz bloga
        </h2>
        <p className="mt-2 text-[var(--ar-gray-500)]">
          Članci o kuhinji, tradiciji i sezonskoj hrani.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} basePath="/blog" />
          ))}
        </div>
        <Link
          href="/blog"
          className="mt-8 inline-block font-semibold text-[var(--color-accent)] hover:text-[var(--ar-primary-hover)] hover:underline"
        >
          Pregledaj sve članke →
        </Link>
      </div>
    </section>
  );
}
