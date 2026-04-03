import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/articles";
import { formatArticleDate } from "@/lib/articles";

const PLACEHOLDER_ARTICLE =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80";

interface ArticleCardProps {
  article: Article;
  basePath: "/saveti" | "/blog";
}

export function ArticleCard({ article, basePath }: ArticleCardProps) {
  const href = `${basePath}/${article.slug}`;
  const imageUrl = article.imageUrl || PLACEHOLDER_ARTICLE;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-none border border-[var(--ar-gray-200)] bg-white transition-all duration-200 hover:border-[var(--color-accent)] hover:shadow-[var(--ar-card-shadow-hover)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ar-gray-100)]">
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {article.category && (
          <span className="absolute left-2 top-2 rounded-none border border-[var(--ar-gray-200)] bg-white/95 px-2 py-1 text-xs font-semibold text-[var(--ar-gray-700)] sm:left-3 sm:top-3">
            {article.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <time
          dateTime={article.publishedAt}
          className="text-xs font-medium text-[var(--ar-gray-500)]"
        >
          {formatArticleDate(article.publishedAt)}
        </time>
        <h2 className="mt-2 font-capriola text-lg font-semibold leading-tight text-[var(--ar-gray-700)] transition-colors group-hover:text-[var(--color-primary)] group-hover:underline sm:text-xl">
          {article.title}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--ar-gray-500)]">
          {article.excerpt}
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-semibold text-[var(--color-accent)] group-hover:text-[var(--ar-primary-hover)]">
          Pročitaj više →
        </span>
      </div>
    </Link>
  );
}
