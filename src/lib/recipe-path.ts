/**
 * Canonical recipe URLs.
 *
 * Kept free of Supabase imports so client components can use it too.
 *
 * A recipe can belong to several categories, and its canonical URL uses one of
 * them. Every place that builds a recipe link has to pick the same one or the
 * link lands on /recepti/[slug]/[recipeSlug], mismatches, and redirects.
 *
 * The rule, shared by search_recipes(), getRecipeBySlug() and the sitemap:
 * prefer a meal_type, then the lowest sort_order, then the slug. Meal types
 * come first because /recepti/{slug} is the meal-type listing -- cuisines live
 * under /kuhinja/{slug}, so a cuisine in a /recepti/ URL points at the wrong
 * section. sort_order is only unique within a type, so it cannot rank alone,
 * and it repeats within meal_type, so the slug is a real tie-break rather than
 * a formality.
 */

export type CategoryRef = {
  slug: string;
  type?: string | null;
  sort_order?: number | null;
};

const FALLBACK_CATEGORY = "ostalo";

/** Never depends on the order rows happen to arrive in. */
export function pickCanonicalCategorySlug(
  categories: ReadonlyArray<CategoryRef | null | undefined> | null | undefined,
): string {
  const usable = (categories ?? []).filter(
    (c): c is CategoryRef => !!c && typeof c.slug === "string" && c.slug.length > 0,
  );
  if (usable.length === 0) return FALLBACK_CATEGORY;

  return [...usable].sort((a, b) => {
    const mealA = a.type === "meal_type" ? 0 : 1;
    const mealB = b.type === "meal_type" ? 0 : 1;
    if (mealA !== mealB) return mealA - mealB;

    const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;

    return a.slug.localeCompare(b.slug);
  })[0].slug;
}

/**
 * Accepts either the flat `categories` array returned by search_recipes() or
 * the nested `recipe_categories` shape returned by an embedded select.
 */
export function getRecipeCanonicalPath(recipe: {
  slug: string;
  categories?: ReadonlyArray<CategoryRef | null | undefined> | null;
  recipe_categories?: ReadonlyArray<{ category?: CategoryRef | null }> | null;
}): string {
  const fromEmbed = recipe.recipe_categories?.map((rc) => rc?.category);
  const categories = recipe.categories ?? fromEmbed;
  return `/recepti/${pickCanonicalCategorySlug(categories)}/${recipe.slug}`;
}
