import { getListingMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { getPublishedBlogArticles } from "@/lib/queries/articles";
import { BLOG_ARTICLES } from "@/lib/articles";

export const metadata = getListingMetadata({
  title: "Blog",
  description:
    "Članci o kuhinji, tradiciji, sezonskoj hrani i zdravim obrocima. Saveti i priče za ljubitelje kuvanja.",
  path: "/blog",
});

export default async function BlogPage() {
  const fromDb = await getPublishedBlogArticles();
  const articles = fromDb.length > 0 ? fromDb : BLOG_ARTICLES;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-capriola text-3xl font-bold text-[var(--ar-gray-900)] sm:text-4xl">
          Blog
        </h1>
        <p className="mt-2 text-[var(--ar-gray-500)]">
          Članci o kuhinji, tradiciji, sezonskoj hrani i zdravim obrocima.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} basePath="/blog" />
          ))}
        </div>
      </div>
    </div>
  );
}
