import Link from "next/link";
import {
  getFilterCategories,
  getPublishedRecipes,
  getRecipesForIngredientSearch,
} from "@/lib/queries/recipes";
import { resolveSearchLabel } from "@/lib/search-topics";
import { getListingMetadata } from "@/lib/seo";
import { CategoryRecipeSection } from "@/components/recipes/CategoryRecipeSection";
import { RecipeCard } from "@/components/RecipeCard";

export const metadata = getListingMetadata({
  title: "Recepti",
  description: "Pregledajte sve recepte. Filtrirajte po kategoriji, težini, vremenu, sastojcima i kuhinji.",
  path: "/recepti",
});

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ sastojak?: string }>;
}) {
  const raw = await searchParams;
  const sastojak = typeof raw?.sastojak === "string" ? raw.sastojak.trim() : "";
  const isSearch = sastojak.length > 0;
  // A popular-search chip carries a topic name; show its own spelling ("Voće"),
  // not whatever casing arrived in the URL.
  const searchLabel = resolveSearchLabel(sastojak);

  let categories: Awaited<ReturnType<typeof getFilterCategories>> = [];

  try {
    const all = await getFilterCategories();
    categories = all.filter((c) => c.type === "meal_type");
  } catch {
    categories = [];
  }

  const categoryRecipes = await Promise.all(
    categories.map(async (c) => {
      const recipes = await getPublishedRecipes(100, 0, { categorySlug: c.slug });
      return { category: c, recipes };
    })
  );

  let searchRecipes: Awaited<ReturnType<typeof getPublishedRecipes>> = [];
  if (isSearch) {
    searchRecipes = await getRecipesForIngredientSearch(sastojak);
  }

  return (
    <div>
      <div className="mx-auto max-w-[1220px] px-8 py-10">
        <header className="text-center">
          <h1 className="font-display text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
            {isSearch ? `Recepti sa: ${searchLabel}` : "Recepti"}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-base text-[var(--ar-gray-700)]">
            {isSearch
              ? `${searchRecipes.length} ${searchRecipes.length === 1 ? "recept" : "recepta"} sa ovim sastojkom.`
              : "Šta za večeru? Nađite odgovor među našim popularnim receptima, filtrirajte po kategoriji."}
          </p>
          {isSearch && (
            <Link
              href="/recepti"
              className="mt-4 inline-block text-sm font-semibold text-[var(--ar-primary-ink)] hover:text-[var(--ar-primary-ink-hover)] hover:underline"
            >
              ← Pregledaj sve recepte
            </Link>
          )}
        </header>
      </div>

      {isSearch ? (
        <div className="border-t border-[var(--ar-gray-200)] bg-white py-8">
          <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
            {searchRecipes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {searchRecipes.map((r) => (
                  <RecipeCard
                    key={r.id}
                    slug={r.slug}
                    title={r.title_sr}
                    imageUrl={r.image_url}
                    prepTime={r.prep_time_minutes}
                    cookTime={r.cook_time_minutes}
                    ratingCount={(r as { rating_count?: number }).rating_count ?? 0}
                    ratingAvg={(r as { rating_avg?: number | null }).rating_avg}
                  />
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-[var(--ar-gray-500)]">
                Nema recepta sa sastojkom &quot;{searchLabel}&quot;. Pokušajte drugi sastojak ili{" "}
                <Link href="/recepti" className="font-semibold text-[var(--ar-primary-ink)] hover:underline">
                  pregledajte sve recepte
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {categories.length > 0 && (
            <div className="sticky top-0 z-10 border-b border-[var(--ar-gray-200)] bg-white py-4">
              <div className="mx-auto max-w-[1220px] px-8">
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {categories.map((c) => (
                    <a
                      key={c.id}
                      href={`#${c.slug}`}
                      className="rounded-none px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors bg-[var(--ar-gray-200)] text-[var(--ar-gray-700)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--ar-primary-ink)]"
                    >
                      {c.name_sr}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {categoryRecipes.map(({ category, recipes }, index) => (
            <CategoryRecipeSection
              key={category.id}
              title={category.name_sr}
              slug={category.slug}
              recipes={recipes}
              variant={index % 2 === 0 ? "white" : "cream"}
            />
          ))}
        </>
      )}
    </div>
  );
}
