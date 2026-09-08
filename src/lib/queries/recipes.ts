import { createPublicClient } from "@/lib/supabase/public";
import { getAuthorDisplayName, getAuthorDisplayNames } from "@/lib/profile";
import { resolveSearchTerms } from "@/lib/search-topics";

const FALLBACK_AUTHOR = "Domaći kuvar";

export type RecipeCategory = {
  id: string;
  slug: string;
  name_sr: string;
  type?: string | null;
  sort_order?: number | null;
};

export type RecipeFilters = {
  categorySlug?: string;
  skillLevel?: "lako" | "srednje" | "tesko";
  maxTimeMinutes?: number;
  minTimeMinutes?: number;
  ingredientQuery?: string;
  cuisineSlug?: string;
};

/** Row shape returned by the search_recipes() Postgres function. */
type SearchRecipeRow = {
  id: string;
  slug: string;
  title_sr: string;
  description_sr: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  author_id: string | null;
  author_name: string | null;
  image_url: string | null;
  skill_level: string | null;
  created_at: string;
  rating_count: number | string | null;
  rating_avg: number | string | null;
  categories: RecipeCategory[] | null;
};

/** Postgres numeric and bigint can arrive as strings once they leave PostgREST. */
function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Rating count and average per recipe, in one round trip. */
async function fetchRatingSummaries(
  recipeIds: string[],
): Promise<Record<string, { count: number; avg: number | null }>> {
  const summaries: Record<string, { count: number; avg: number | null }> = {};
  for (const id of recipeIds) summaries[id] = { count: 0, avg: null };
  if (recipeIds.length === 0) return summaries;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("ratings")
    .select("recipe_id, stars")
    .in("recipe_id", recipeIds);

  const totals: Record<string, number> = {};
  for (const row of (data ?? []) as { recipe_id: string; stars: number }[]) {
    const summary = summaries[row.recipe_id];
    if (!summary) continue;
    summary.count += 1;
    totals[row.recipe_id] = (totals[row.recipe_id] ?? 0) + row.stars;
  }
  for (const id of recipeIds) {
    const summary = summaries[id];
    if (summary.count > 0) summary.avg = totals[id] / summary.count;
  }
  return summaries;
}

export async function getFilterCategories(): Promise<
  { id: string; slug: string; name_sr: string; type: string }[]
> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_sr, type")
    .in("type", ["meal_type", "cuisine"])
    .order("type")
    .order("sort_order");
  if (error) return [];
  return (data as { id: string; slug: string; name_sr: string; type: string }[]) ?? [];
}

export async function getDistinctIngredients(limit = 80): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("name_sr")
    .order("name_sr");
  if (error) return [];
  const names = (data || []).map((r) => (r as { name_sr: string }).name_sr?.trim()).filter(Boolean);
  return [...new Set(names)].slice(0, limit);
}

export async function getRecipeCount(): Promise<number> {
  const supabase = createPublicClient();
  const { count, error } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return error ? 0 : count ?? 0;
}

/**
 * Published recipes, filtered and paginated entirely in Postgres by
 * search_recipes(). Every filter -- category, cuisine, skill, total time and
 * ingredient -- is applied before LIMIT/OFFSET, so paging stays correct at any
 * catalogue size.
 */
export async function getPublishedRecipes(
  limit = 12,
  offset = 0,
  filters?: RecipeFilters,
) {
  const supabase = createPublicClient();

  const { data, error } = await supabase.rpc("search_recipes", {
    p_limit: limit,
    p_offset: offset,
    p_category_slug: filters?.categorySlug ?? null,
    p_cuisine_slug: filters?.cuisineSlug ?? null,
    p_skill_level: filters?.skillLevel ?? null,
    p_max_time:
      filters?.maxTimeMinutes != null && filters.maxTimeMinutes > 0
        ? filters.maxTimeMinutes
        : null,
    p_min_time:
      filters?.minTimeMinutes != null && filters.minTimeMinutes > 0
        ? filters.minTimeMinutes
        : null,
    p_ingredient: filters?.ingredientQuery?.trim() || null,
  });

  if (error) {
    console.error("getPublishedRecipes:", error.message);
    return [];
  }

  const rows = (data ?? []) as SearchRecipeRow[];
  if (rows.length === 0) return [];

  const authorIds = rows.map((r) => r.author_id).filter(Boolean) as string[];
  const authorNames = authorIds.length > 0 ? await getAuthorDisplayNames(authorIds) : {};

  return rows.map((row) => {
    const { rating_count, rating_avg, categories, ...recipe } = row;
    const count = toNumber(rating_count);
    return {
      ...recipe,
      categories: categories ?? [],
      rating_count: count,
      rating_avg: count > 0 ? toNullableNumber(rating_avg) : null,
      author_display_name: row.author_id
        ? authorNames[row.author_id] ?? row.author_name ?? FALLBACK_AUTHOR
        : row.author_name ?? FALLBACK_AUTHOR,
    };
  });
}

export type PublishedRecipe = Awaited<
  ReturnType<typeof getPublishedRecipes>
>[number];

/**
 * Recipes behind a search box or a "Popularne pretrage" chip.
 *
 * A known topic expands into several ingredient stems (see search-topics.ts),
 * and each stem runs as its own indexed query because search_recipes() takes a
 * single ingredient. One round trip per stem is a deliberate trade: the stem
 * lists are short, the queries run in parallel, and every page that calls this
 * is cached for minutes at a time -- cheaper than fetching rows to filter in
 * JavaScript, which is what pushing search into Postgres was meant to end.
 */
export async function getRecipesForIngredientSearch(
  query: string,
  limit = 100,
): Promise<PublishedRecipe[]> {
  const terms = resolveSearchTerms(query);
  if (terms.length === 0) return [];
  if (terms.length === 1) {
    return getPublishedRecipes(limit, 0, { ingredientQuery: terms[0] });
  }

  const pages = await Promise.all(
    terms.map((term) => getPublishedRecipes(limit, 0, { ingredientQuery: term })),
  );

  // A recipe matching several stems ("svinjsko" and "slanina") appears once.
  const byId = new Map<string, PublishedRecipe>();
  for (const page of pages) {
    for (const recipe of page) byId.set(recipe.id, recipe);
  }

  return [...byId.values()]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, limit);
}

/**
 * Every published recipe as a {slug, recipeSlug} pair, matching the canonical
 * /recepti/{category}/{recipe} shape. Used by generateStaticParams so recipe
 * pages are prerendered rather than rendered per request.
 */
export async function getRecipeRouteParams(): Promise<
  { slug: string; recipeSlug: string }[]
> {
  const supabase = createPublicClient();

  const [recipesRes, linksRes] = await Promise.all([
    supabase.from("recipes").select("id, slug").eq("status", "published"),
    supabase.from("recipe_categories").select("recipe_id, category:categories(slug)"),
  ]);

  const recipes = (recipesRes.data ?? []) as { id: string; slug: string }[];
  if (recipes.length === 0) return [];

  const firstCategory: Record<string, string> = {};
  for (const row of linksRes.data ?? []) {
    const raw = row as unknown as {
      recipe_id: string;
      category?: { slug: string } | { slug: string }[];
    };
    const cat = Array.isArray(raw.category) ? raw.category[0] : raw.category;
    if (cat?.slug && !firstCategory[raw.recipe_id]) {
      firstCategory[raw.recipe_id] = cat.slug;
    }
  }

  return recipes.map((r) => ({
    slug: firstCategory[r.id] ?? "ostalo",
    recipeSlug: r.slug,
  }));
}

export { getRecipeCanonicalPath } from "@/lib/recipe-path";

export async function getRecipeBySlug(slug: string) {
  const supabase = createPublicClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      `
      *,
      recipe_nutrition(*),
      recipe_categories(category:categories(id, slug, name_sr, type, sort_order))
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !recipe) return null;

  const recipeId = recipe.id;

  // Ingredients and directions are fetched explicitly because the embedded
  // select has proven unreliable for ordering.
  const [ingredientsRes, directionsRes, ratingsRes, reviewCountRes] = await Promise.all([
    supabase.from("ingredients").select("*").eq("recipe_id", recipeId).order("sort_order"),
    supabase.from("directions").select("*").eq("recipe_id", recipeId).order("sort_order"),
    supabase.from("ratings").select("stars").eq("recipe_id", recipeId),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", recipeId)
      .eq("status", "approved"),
  ]);

  const ratings = (ratingsRes.data ?? []) as { stars: number }[];
  const ratingCount = ratings.length;
  const ratingAvg =
    ratingCount > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount : null;

  const author_display_name = recipe.author_id
    ? await getAuthorDisplayName(recipe.author_id)
    : (recipe.author_name as string | null) || FALLBACK_AUTHOR;

  return {
    ...recipe,
    ingredients: ingredientsRes.data ?? [],
    directions: directionsRes.data ?? [],
    rating_avg: ratingAvg,
    rating_count: ratingCount,
    review_count: reviewCountRes.count ?? 0,
    author_display_name,
  };
}

export async function getFeaturedRecipesWithReviews(limit = 6) {
  const supabase = createPublicClient();

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      slug,
      title_sr,
      image_url,
      prep_time_minutes,
      cook_time_minutes,
      author_id,
      author_name,
      recipe_categories(category:categories(id, slug, name_sr, type, sort_order))
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !recipes?.length) return [];

  const recipeIds = recipes.map((r) => r.id);
  const authorIds = recipes.map((r) => r.author_id).filter(Boolean) as string[];

  const [authorNames, ratingSummaries, reviewsRes] = await Promise.all([
    authorIds.length > 0
      ? getAuthorDisplayNames(authorIds)
      : Promise.resolve({} as Record<string, string>),
    fetchRatingSummaries(recipeIds),
    supabase
      .from("reviews")
      .select("recipe_id, content")
      .in("recipe_id", recipeIds)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
  ]);

  const reviewByRecipe: Record<string, string> = {};
  for (const r of (reviewsRes.data ?? []) as { recipe_id: string; content: string }[]) {
    if (!reviewByRecipe[r.recipe_id]) reviewByRecipe[r.recipe_id] = r.content;
  }

  return recipes.map((r) => {
    const stats = ratingSummaries[r.id];
    const { recipe_categories, ...recipe } = r as unknown as Omit<typeof r, never> & {
      recipe_categories?: Array<{
        category?: RecipeCategory | RecipeCategory[] | null;
      }> | null;
    };
    // PostgREST embeds come back as arrays when the relationship is ambiguous.
    const categories = (recipe_categories ?? [])
      .map((rc) => (Array.isArray(rc?.category) ? rc.category[0] : rc?.category))
      .filter(Boolean) as unknown as RecipeCategory[];
    return {
      ...recipe,
      categories,
      rating_count: stats.count,
      rating_avg: stats.avg,
      review_quote: reviewByRecipe[r.id] || null,
      author_display_name: r.author_id
        ? authorNames[r.author_id] ?? r.author_name ?? FALLBACK_AUTHOR
        : r.author_name ?? FALLBACK_AUTHOR,
    };
  });
}

/**
 * search_recipes() already returns rating aggregates, so this is just a
 * category-scoped call.
 */
export async function getSectionRecipes(categorySlug: string | null, limit = 6) {
  return getPublishedRecipes(limit, 0, categorySlug ? { categorySlug } : undefined);
}

export async function getRelatedRecipes(
  recipeId: string,
  categoryIds: string[],
  limit = 8
) {
  if (categoryIds.length === 0) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("recipe_categories")
    .select(
      `
      recipe_id,
      recipe:recipes(
        id,
        slug,
        title_sr,
        image_url,
        prep_time_minutes,
        cook_time_minutes
      ),
      category:categories(name_sr, slug)
    `
    )
    .in("category_id", categoryIds)
    .neq("recipe_id", recipeId)
    .limit(limit * 4);

  if (error) return [];

  type RecipeRow = {
    id: string;
    slug: string;
    title_sr: string;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
  };
  const recipeMap = new Map<
    string,
    RecipeRow & { categoryName?: string; primaryCategorySlug?: string }
  >();

  for (const row of data || []) {
    const raw = row as unknown as {
      recipe_id: string;
      recipe?: RecipeRow | RecipeRow[];
      category?: { name_sr: string; slug: string } | { name_sr: string; slug: string }[];
    };
    const r = Array.isArray(raw.recipe) ? raw.recipe[0] : raw.recipe;
    if (!r) continue;

    const cat = Array.isArray(raw.category) ? raw.category[0] : raw.category;
    const categoryName = cat?.name_sr ?? undefined;
    const categorySlug = cat?.slug ?? undefined;

    if (!recipeMap.has(r.id)) {
      recipeMap.set(r.id, { ...r, categoryName, primaryCategorySlug: categorySlug });
    } else {
      const existing = recipeMap.get(r.id)!;
      if (!existing.categoryName && categoryName) existing.categoryName = categoryName;
      if (!existing.primaryCategorySlug && categorySlug) existing.primaryCategorySlug = categorySlug;
    }
    if (recipeMap.size >= limit) break;
  }

  const recipeIds = [...recipeMap.keys()];
  if (recipeIds.length === 0) return [];

  const ratingSummaries = await fetchRatingSummaries(recipeIds);

  return recipeIds.map((id) => {
    const recipe = recipeMap.get(id)!;
    const stats = ratingSummaries[id];
    return { ...recipe, rating_avg: stats.avg, rating_count: stats.count };
  });
}
