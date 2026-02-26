import Link from "next/link";
import { Suspense } from "react";
import { getPublishedRecipes, getFilterCategories } from "@/lib/queries/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { FilterSidebar } from "@/components/recipes/FilterSidebar";
import { getListingMetadata } from "@/lib/seo";

export const metadata = getListingMetadata(
  "Recepti",
  "Pregledajte sve recepte. Filtrirajte po kategoriji, težini, vremenu, sastojcima i kuhinji."
);

function parseTimeParam(
  vreme: string | undefined
): { maxTimeMinutes?: number; minTimeMinutes?: number } {
  if (!vreme) return {};
  switch (vreme) {
    case "do-30":
      return { maxTimeMinutes: 30 };
    case "do-60":
      return { maxTimeMinutes: 60 };
    case "do-120":
      return { maxTimeMinutes: 120 };
    case "120-plus":
      return { minTimeMinutes: 121 };
    default:
      return {};
  }
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{
    kategorija?: string;
    tezina?: string;
    vreme?: string;
    sastojak?: string;
    kuhinja?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const categorySlug = params.kategorija;
  const skillLevel = params.tezina as "lako" | "srednje" | "tesko" | undefined;
  const timeParam = params.vreme;
  const ingredientQuery = params.sastojak?.trim() || undefined;
  const cuisineSlug = params.kuhinja;

  const timeFilter = parseTimeParam(timeParam);
  const validSkill =
    skillLevel && ["lako", "srednje", "tesko"].includes(skillLevel)
      ? skillLevel
      : undefined;

  let recipes: Awaited<ReturnType<typeof getPublishedRecipes>> = [];
  let categories: Awaited<ReturnType<typeof getFilterCategories>> = [];

  try {
    [recipes, categories] = await Promise.all([
      getPublishedRecipes(24, 0, {
        categorySlug,
        skillLevel: validSkill,
        maxTimeMinutes: timeFilter.maxTimeMinutes,
        minTimeMinutes: timeFilter.minTimeMinutes,
        ingredientQuery,
        cuisineSlug,
      }),
      getFilterCategories(),
    ]);
  } catch {
    recipes = [];
    categories = [];
  }

  return (
    <div className="mx-auto max-w-[1284px] px-8 py-10">
      <div className="flex flex-col gap-10 lg:flex-row">
        <Suspense fallback={<div className="w-72 shrink-0" />}>
          <FilterSidebar
            categories={categories}
            activeCategory={categorySlug}
            activeSkill={validSkill}
            activeTime={timeParam}
            activeIngredient={ingredientQuery}
            activeCuisine={cuisineSlug}
          />
        </Suspense>
        <div className="flex-1">
          <h1 className="font-dynapuff text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
            Recepti
          </h1>
          <p className="mt-2 text-[var(--ar-gray-500)]">
            {categorySlug || validSkill || timeParam || ingredientQuery || cuisineSlug
              ? "Recepti prema izabranim filterima."
              : "Pregledajte sve naše recepte. Filtrirajte po kategoriji, težini, vremenu, sastojcima i kuhinji."}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                slug={recipe.slug}
                title={recipe.title_sr}
                imageUrl={recipe.image_url}
                prepTime={recipe.prep_time_minutes}
                cookTime={recipe.cook_time_minutes}
              />
            ))}
          </div>
          {recipes.length === 0 && (
            <div className="border border-[var(--ar-gray-200)] bg-white py-16 text-center">
              <p className="text-[var(--ar-gray-500)]">
                Nema recepta za izabrane filtere.
              </p>
              <Link
                href="/recepti"
                className="mt-4 inline-block font-semibold text-[var(--color-accent)] hover:underline"
              >
                Poništi filtere →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
