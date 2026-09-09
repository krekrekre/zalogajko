import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChefHat } from "lucide-react";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import {
  getRecipeBySlug,
  getRelatedRecipes,
  getRecipeCanonicalPath,
  getRecipeRouteParams,
} from "@/lib/queries/recipes";
import { RecipeActions } from "@/components/RecipeActions";
import { ServingMultiplier } from "@/components/ServingMultiplier";
import type { Direction } from "@/types";
import { getRecipeMetadata } from "@/lib/seo";
import { RecipeSchema } from "@/components/RecipeSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeReviewSection } from "@/components/RecipeReviewSection";

// Recipe content changes rarely; edits call revalidatePath.
export const revalidate = 3600;

export async function generateStaticParams() {
  return getRecipeRouteParams();
}

const SKILL_LEVEL_LABELS: Record<string, string> = {
  lako: "Lako",
  srednje: "Srednje",
  tesko: "Teško",
};

function getCategoriesFromRecipe(recipe: {
  recipe_categories?: Array<{
    category?: { id: string; slug: string; name_sr: string };
    category_id?: string;
  }>;
}) {
  const raw = recipe.recipe_categories || [];
  return raw
    .map((rc) => rc.category)
    .filter(
      (c): c is { id: string; slug: string; name_sr: string } =>
        !!c && "name_sr" in c,
    );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; recipeSlug: string }>;
}) {
  const { recipeSlug } = await params;
  const recipe = await getRecipeBySlug(recipeSlug);
  if (!recipe) return {};
  const categories = (recipe.recipe_categories || [])
    .map((rc: { category?: { name_sr?: string } }) => rc.category?.name_sr)
    .filter(Boolean) as string[];
  const canonicalPath = getRecipeCanonicalPath(recipe);
  return getRecipeMetadata({
    title: recipe.title_sr,
    description: recipe.description_sr || undefined,
    image: recipe.image_url,
    slug: recipeSlug,
    canonicalPath,
    publishedTime: recipe.created_at ?? undefined,
    modifiedTime: recipe.updated_at ?? undefined,
    keywords: categories.length ? [recipe.title_sr, ...categories] : undefined,
  });
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string; recipeSlug: string }>;
}) {
  const { slug: categoryParam, recipeSlug } = await params;
  const recipe = await getRecipeBySlug(recipeSlug);
  if (!recipe) notFound();

  const canonicalPath = getRecipeCanonicalPath(recipe);
  const canonicalCategorySlugFromPath = canonicalPath.split("/")[2];
  if (categoryParam !== canonicalCategorySlugFromPath) {
    redirect(canonicalPath);
  }

  const categoryIds = (recipe.recipe_categories || [])
    .map(
      (rc: { category?: { id: string }; category_id?: string }) =>
        rc.category?.id ?? rc.category_id,
    )
    .filter(Boolean) as string[];
  const related = await getRelatedRecipes(recipe.id, categoryIds, 8);

  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

  const categories = getCategoriesFromRecipe(recipe);
  const canonicalCategorySlug = canonicalPath.split("/")[2];
  const canonicalCategory = categories.find((c) => c.slug === canonicalCategorySlug);

  const breadcrumbItems = [
    { name: "Recepti", path: "/recepti" },
    ...(canonicalCategory
      ? [{ name: canonicalCategory.name_sr, path: `/recepti/${canonicalCategory.slug}` }]
      : []),
    { name: recipe.title_sr, path: canonicalPath },
  ];

  const sortedDirections = [...(recipe.directions || [])].sort(
    (a: Direction, b: Direction) => a.sort_order - b.sort_order,
  );

  return (
    <>
      <RecipeSchema recipe={recipe} canonicalPath={canonicalPath} />
      <BreadcrumbSchema items={breadcrumbItems} />
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
                      <span className="text-[var(--ar-gray-700)]" aria-current="page">
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

              <h1 className="mt-3 break-words text-3xl font-bold leading-tight text-[var(--ar-gray-900)] sm:text-4xl lg:text-[46px]">
                {recipe.title_sr}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {/* TODO: restore rating stars and review count – see future.md */}
              </div>

              {recipe.description_sr && (
                <p className="mt-4 whitespace-pre-line break-words text-[var(--ar-gray-700)] leading-relaxed">
                  {recipe.description_sr}
                </p>
              )}

              <div className="mt-2 pt-1 text-sm text-[var(--ar-gray-600)]">
                Autor:{" "}
                {recipe.author_id ? (
                  <Link
                    href={`/profil/${recipe.author_id}`}
                    className="font-medium text-[var(--ar-gray-700)] hover:underline hover:decoration-[var(--color-accent)]"
                  >
                    {(recipe as { author_display_name?: string }).author_display_name || "Domaći kuvar"}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--ar-gray-700)]">
                    {(recipe as { author_display_name?: string }).author_display_name || "Domaći kuvar"}
                  </span>
                )}
                <span className="mx-3 inline-block">•</span>
                Ažurirano:{" "}
                <span className="font-medium text-[var(--ar-gray-700)]">
                  {new Date(recipe.updated_at).toLocaleDateString("sr-RS", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <RecipeActions
                recipeId={recipe.id}
                slug={recipeSlug}
                title={recipe.title_sr}
                imageUrl={recipe.image_url}
                canonicalPath={canonicalPath}
              />
              <div className="relative mt-6 aspect-[4/3] overflow-hidden shadow-[var(--ar-card-shadow)]">
                <Image
                  src={recipe.image_url || PLACEHOLDER_IMAGES.default}
                  alt={recipe.title_sr}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-6 overflow-hidden border border-[color:color-mix(in_srgb,black_20%,transparent)] border-t-12 border-t-[color:color-mix(in_srgb,#46deb6_20%,transparent)] bg-[#ffffff] p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-x-10 gap-y-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--ar-gray-900)]">
                      Aktivno vreme:
                    </p>
                    <p className="text-sm font-normal text-[var(--ar-gray-700)]">
                      {recipe.prep_time_minutes} min
                    </p>
                  </div>
                  {recipe.cook_time_minutes > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[var(--ar-gray-900)]">
                        Ukupno vreme:
                      </p>
                      <p className="text-sm font-normal text-[var(--ar-gray-700)]">
                        {totalTime} min
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-[var(--ar-gray-900)]">
                      Porcije:
                    </p>
                    <p className="text-sm font-normal text-[var(--ar-gray-700)]">
                      {recipe.servings}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--ar-gray-900)]">
                      Težina:
                    </p>
                    <p className="text-sm font-normal text-[var(--ar-gray-700)]">
                      {recipe.skill_level
                        ? SKILL_LEVEL_LABELS[recipe.skill_level] ?? recipe.skill_level
                        : "—"}
                    </p>
                  </div>
                </div>
                <hr className="my-4 border-[color:color-mix(in_srgb,black_20%,transparent)]" />
                {recipe.recipe_nutrition && (
                  <p className="text-center">
                    <a
                      href="#nutrition"
                      className="text-sm font-medium text-[var(--color-primary)] underline decoration-[var(--color-accent)] hover:no-underline"
                    >
                      Pogledaj nutritivnu vrednost
                    </a>
                  </p>
                )}
              </div>
              {recipe.why_youll_love && recipe.why_youll_love.length > 0 && (
                // Framed box with the heading sitting in a gap in its own top
                // border. The heading's background has to match the page for
                // the border to read as interrupted rather than crossed out.
                <div className="relative mt-8 border border-[var(--ar-primary-ink)] px-5 pb-6 pt-9 sm:px-8 sm:pb-8">
                  <h2 className="absolute left-1/2 top-0 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-center text-[13px] font-bold uppercase leading-tight tracking-[0.12em] text-[var(--ar-primary-ink)]">
                    Zašto ćete voleti ovaj recept
                  </h2>
                  <ul className="space-y-4 text-base leading-relaxed text-[var(--color-primary)] sm:text-[17px]">
                    {recipe.why_youll_love.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ar-primary)]"
                          aria-hidden
                        />
                        <span className="min-w-0 break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(recipe.ingredients) &&
              recipe.ingredients.length > 0 ? (
                <ServingMultiplier
                  ingredients={recipe.ingredients}
                  baseServings={recipe.servings}
                />
              ) : (
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-[var(--ar-gray-700)] sm:text-[36px]">
                    Sastojci :
                  </h2>
                  <p className="mt-2 text-sm text-[var(--ar-gray-500)]">
                    Nema unetih sastojaka.
                  </p>
                </div>
              )}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-[var(--ar-gray-700)] sm:text-[36px]">
                  Uputstvo
                </h2>
                <ol className="mt-4 list-none space-y-6 pl-0">
                  {sortedDirections.map((step: Direction, index: number) => (
                    <li
                      key={step.id}
                      className="text-base text-[var(--ar-gray-700)] sm:text-[18px]"
                    >
                      <span className="inline-block font-semibold text-[var(--ar-gray-900)] border-b-2 border-[var(--ar-primary)] pb-1">
                        {step.step_number ?? index + 1}. korak
                      </span>
                      <p className="mt-3 whitespace-pre-line break-words text-base sm:text-[18px]">
                        {step.instruction_sr}
                      </p>
                      {step.image_url && (
                        <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-none border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)]">
                          <Image
                            src={step.image_url}
                            alt={`${recipe.title_sr} - korak ${step.step_number}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
                {sortedDirections.length === 0 && (
                  <p className="mt-2 text-sm text-[var(--ar-gray-500)]">
                    Nema unetih koraka pripreme.
                  </p>
                )}
              </div>
              {recipe.chef_tip_sr?.trim() && (
                // Same left teal rule as the callout below it, but on white --
                // an aside to the method, without competing with the cream
                // block for attention.
                <div className="mt-8 border border-[var(--ar-gray-200)] border-l-4 border-l-[var(--ar-primary)] bg-white p-5 sm:p-6">
                  <h2 className="flex items-center gap-2.5 text-lg font-semibold uppercase tracking-wide text-[var(--color-primary)] sm:text-xl">
                    <ChefHat
                      className="h-5 w-5 shrink-0 text-[var(--ar-primary-ink)]"
                      aria-hidden
                    />
                    Savet kuvara
                  </h2>
                  <p className="mt-3 whitespace-pre-line break-words text-base leading-relaxed text-[var(--color-primary)] sm:text-[18px]">
                    {recipe.chef_tip_sr}
                  </p>
                </div>
              )}
              {recipe.recipe_nutrition && (
                <div className="mt-8 bg-[#ffffff] p-4 sm:p-6 sm:pl-0">
                  <h2
                    id="nutrition"
                    className="scroll-mt-24 text-2xl font-semibold text-[var(--ar-gray-700)] sm:text-[36px]"
                  >
                    Nutritivna vrednost{" "}
                    <span className="block text-base font-normal text-[var(--ar-gray-600)] sm:inline sm:text-xl">
                      (po porciji)
                    </span>
                  </h2>
                  <div className="mt-6 flex flex-wrap justify-between gap-x-8 gap-y-6">
                    {recipe.recipe_nutrition.calories != null && (
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-[var(--ar-gray-900)] sm:text-[22px]">
                          {recipe.recipe_nutrition.calories}
                        </span>
                        <span className="mt-1 text-base font-normal text-[var(--ar-gray-700)] sm:text-[18px]">
                          Kalorije
                        </span>
                      </div>
                    )}
                    {recipe.recipe_nutrition.fat_g != null && (
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-[var(--ar-gray-900)] sm:text-[22px]">
                          {recipe.recipe_nutrition.fat_g}g
                        </span>
                        <span className="mt-1 text-base font-normal text-[var(--ar-gray-700)] sm:text-[18px]">
                          Masti
                        </span>
                      </div>
                    )}
                    {recipe.recipe_nutrition.carbs_g != null && (
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-[var(--ar-gray-900)] sm:text-[22px]">
                          {recipe.recipe_nutrition.carbs_g}g
                        </span>
                        <span className="mt-1 text-base font-normal text-[var(--ar-gray-700)] sm:text-[18px]">
                          Ugljeni hidrati
                        </span>
                      </div>
                    )}
                    {recipe.recipe_nutrition.protein_g != null && (
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-[var(--ar-gray-900)] sm:text-[22px]">
                          {recipe.recipe_nutrition.protein_g}g
                        </span>
                        <span className="mt-1 text-base font-normal text-[var(--ar-gray-700)] sm:text-[18px]">
                          Proteini
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <RecipeReviewSection
                recipeId={recipe.id}
                recipeTitle={recipe.title_sr}
                reviewCount={recipe.review_count ?? 0}
              />
            </article>

            {/* Right column: ads (300px) - only beside main article */}
            <aside className="hidden min-w-0 lg:block" aria-label="Reklame">
              <div className="sticky top-8 min-h-[400px] rounded-none border border-dashed border-[var(--ar-gray-300)] bg-[var(--ar-gray-50)] flex items-center justify-center text-sm text-[var(--ar-gray-500)]">
                Reklama (300×250)
              </div>
            </aside>
          </div>
        </div>

        {/* Takođe će vam se svideti - full width, max 1220px, no ad column */}
        {related.length > 0 && (
          <div
            className="py-10 sm:py-12"
            style={{
              background: "linear-gradient(to bottom, #ffffff 0%, #ffffff 20%, #f1f1e6 20%, #f1f1e6 100%)",
            }}
          >
            <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-semibold text-[var(--ar-gray-700)]">
                Takođe će vam se svideti
              </h2>
              <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {related.map((r) => (
                  <RecipeCard
                    key={r.id}
                    slug={r.slug}
                    title={r.title_sr}
                    imageUrl={r.image_url}
                    prepTime={r.prep_time_minutes}
                    cookTime={r.cook_time_minutes}
                    ratingCount={r.rating_count ?? 0}
                    ratingAvg={r.rating_avg}
                    tag={r.categoryName}
                    categorySlug={r.primaryCategorySlug}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
