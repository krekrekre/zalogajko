import Link from "next/link";
import { getPublishedRecipes } from "@/lib/queries/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { getListingMetadata } from "@/lib/seo";

// Public, read-only page: serve from cache and refresh in the background.
export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ingredient: string }>;
}) {
  const { ingredient } = await params;
  const name = decodeURIComponent(ingredient);
  return getListingMetadata({
    title: `Recepti sa: ${name}`,
    description: `Recepti koji sadrže sastojak ${name}.`,
    path: `/sastojci/${encodeURIComponent(name)}`,
  });
}

export default async function SastojciIngredientPage({
  params,
}: {
  params: Promise<{ ingredient: string }>;
}) {
  const { ingredient } = await params;
  const ingredientName = decodeURIComponent(ingredient);

  const recipes = await getPublishedRecipes(100, 0, {
    ingredientQuery: ingredientName,
  });

  const breadcrumbItems = [
    { name: "Sastojci A–Ž", path: "/sastojci" },
    { name: ingredientName, path: `/sastojci/${encodeURIComponent(ingredientName)}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-[var(--ar-gray-600)]" aria-label="Breadcrumb">
          <Link href="/sastojci" className="hover:text-[var(--color-primary)]">
            Sastojci A–Ž
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--ar-gray-900)]" aria-current="page">
            {ingredientName}
          </span>
        </nav>
        <h1 className="font-capriola text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
          Recepti sa: {ingredientName}
        </h1>
        <p className="mt-2 text-[var(--ar-gray-700)]">
          {recipes.length} {recipes.length === 1 ? "recept" : "recepta"} sa ovim sastojkom.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              slug={r.slug}
              title={r.title_sr}
              imageUrl={r.image_url}
              prepTime={r.prep_time_minutes}
              cookTime={r.cook_time_minutes}
              ratingCount={(r as { rating_count?: number }).rating_count ?? 0}
              ratingAvg={(r as { rating_avg?: number | null }).rating_avg}
              categorySlug={(r as { categories?: Array<{ slug: string }> }).categories?.[0]?.slug}
            />
          ))}
        </div>
        {recipes.length === 0 && (
          <p className="py-12 text-center text-[var(--ar-gray-500)]">
            Nema recepta sa ovim sastojkom.
          </p>
        )}
      </div>
    </>
  );
}
