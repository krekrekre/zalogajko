import { getListingMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { getPublishedArticles } from "@/lib/queries/articles";
import { SAVETI_ARTICLES } from "@/lib/articles";

// Public, read-only page: serve from cache and refresh in the background.
export const revalidate = 900;

export const metadata = getListingMetadata({
  title: "Saveti",
  description:
    "Korisni saveti za kuvanje, čuvanje namirnica, zamenjivanje sastojaka i organizaciju kuhinje.",
  path: "/saveti",
});

export default async function SavetiPage() {
  const fromDb = await getPublishedArticles("saveti");
  const articles = fromDb.length > 0 ? fromDb : SAVETI_ARTICLES;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-[var(--ar-gray-900)] sm:text-4xl">
          Saveti
        </h1>
        <p className="mt-2 text-[var(--ar-gray-500)]">
          Korisni saveti za kuvanje, čuvanje namirnica i organizaciju kuhinje.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} basePath="/saveti" />
          ))}
        </div>
      </div>
    </div>
  );
}
