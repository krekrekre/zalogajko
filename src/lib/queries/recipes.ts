import { createClient } from "@/lib/supabase/server";

export async function getFilterCategories(): Promise<
  { id: string; slug: string; name_sr: string; type: string }[]
> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("name_sr")
    .order("name_sr");
  if (error) return [];
  const names = (data || []).map((r) => (r as { name_sr: string }).name_sr?.trim()).filter(Boolean);
  return [...new Set(names)].slice(0, limit);
}

export async function getRecipeCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return error ? 0 : count ?? 0;
}

export async function getPublishedRecipes(
  limit = 12,
  offset = 0,
  filters?: {
    categorySlug?: string;
    skillLevel?: "lako" | "srednje" | "tesko";
    maxTimeMinutes?: number;
    minTimeMinutes?: number;
    ingredientQuery?: string;
    cuisineSlug?: string;
  }
) {
  const supabase = await createClient();
  const categorySlug = filters?.categorySlug;

  let query = supabase
    .from("recipes")
    .select(
      `
      id,
      slug,
      title_sr,
      description_sr,
      prep_time_minutes,
      cook_time_minutes,
      servings,
      author_name,
      image_url,
      skill_level,
      created_at
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Category filter (meal_type) – recipe must be in this category
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) {
      const { data: rcIds } = await supabase
        .from("recipe_categories")
        .select("recipe_id")
        .eq("category_id", cat.id);
      const ids = (rcIds || []).map((r) => r.recipe_id);
      if (ids.length > 0) {
        query = query.in("id", ids) as typeof query;
      } else {
        return [];
      }
    }
  }

  // Skill level
  if (filters?.skillLevel) {
    query = query.eq("skill_level", filters.skillLevel) as typeof query;
  }

  // Max total time (prep + cook)
  if (filters?.maxTimeMinutes != null && filters.maxTimeMinutes > 0) {
    // Supabase doesn't support (prep_time_minutes + cook_time_minutes) in one filter easily;
    // we filter in memory after fetch, or use RPC. For simplicity we fetch and filter.
    // Alternatively: raw filter with "prep_time_minutes + cook_time_minutes.lte" if supported.
    // PostgREST: we need .or(`prep_time_minutes.lte.${filters.maxTimeMinutes}`) but that's only one column.
    // So: fetch more and filter, or create a DB view. We'll filter after get for now.
  }

  // Cuisine – recipe must be in this cuisine category
  if (filters?.cuisineSlug) {
    const { data: cuisineCat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.cuisineSlug)
      .eq("type", "cuisine")
      .single();
    if (cuisineCat) {
      const { data: cuisineRcIds } = await supabase
        .from("recipe_categories")
        .select("recipe_id")
        .eq("category_id", cuisineCat.id);
      const cuisineIds = (cuisineRcIds || []).map((r) => r.recipe_id);
      if (cuisineIds.length > 0) {
        query = query.in("id", cuisineIds) as typeof query;
      } else {
        return [];
      }
    }
  }

  const hasInMemoryFilters =
    (filters?.ingredientQuery?.trim()?.length ?? 0) > 0 ||
    (filters?.maxTimeMinutes != null && filters.maxTimeMinutes > 0) ||
    (filters?.minTimeMinutes != null && filters.minTimeMinutes > 0);
  const fetchSize = hasInMemoryFilters ? 500 : limit;
  const fetchOffset = hasInMemoryFilters ? 0 : offset;

  let { data, error } = await query.range(fetchOffset, fetchOffset + fetchSize - 1);
  if (error) {
    console.error("getPublishedRecipes:", error);
    return [];
  }

  let recipes = data || [];

  // Ingredient search – recipes that contain an ingredient matching the query
  if (filters?.ingredientQuery?.trim()) {
    const term = filters.ingredientQuery.trim();
    const { data: ingRows } = await supabase
      .from("ingredients")
      .select("recipe_id")
      .ilike("name_sr", `%${term}%`);
    const recipeIdsFromIng = [...new Set((ingRows || []).map((r) => r.recipe_id))];
    if (recipeIdsFromIng.length > 0) {
      recipes = recipes.filter((r) => recipeIdsFromIng.includes(r.id));
    } else {
      recipes = [];
    }
  }

  // Max time filter (prep + cook)
  if (filters?.maxTimeMinutes != null && filters.maxTimeMinutes > 0) {
    recipes = recipes.filter(
      (r) => r.prep_time_minutes + r.cook_time_minutes <= filters!.maxTimeMinutes!
    );
  }

  // Min time filter (e.g. "preko 2 h")
  if (filters?.minTimeMinutes != null && filters.minTimeMinutes > 0) {
    recipes = recipes.filter(
      (r) => r.prep_time_minutes + r.cook_time_minutes >= filters!.minTimeMinutes!
    );
  }

  // Apply offset and limit
  recipes = recipes.slice(offset, offset + limit);

  const recipeIds = recipes.map((r) => r.id);
  if (recipeIds.length === 0) return [];

  const { data: rcData } = await supabase
    .from("recipe_categories")
    .select("recipe_id, category:categories(id, slug, name_sr)")
    .in("recipe_id", recipeIds);

  const categoriesByRecipe: Record<string, Array<{ id: string; slug: string; name_sr: string }>> = {};
  for (const rc of rcData || []) {
    const raw = rc as unknown as { recipe_id: string; category?: unknown };
    const cat = Array.isArray(raw.category) ? raw.category[0] : raw.category;
    if (cat && typeof cat === "object" && "id" in cat && "name_sr" in cat) {
      const c = cat as { id: string; slug: string; name_sr: string };
      if (!categoriesByRecipe[rc.recipe_id]) categoriesByRecipe[rc.recipe_id] = [];
      categoriesByRecipe[rc.recipe_id].push(c);
    }
  }

  return recipes.map((r) => ({
    ...r,
    categories: categoriesByRecipe[r.id] || [],
  }));
}

export async function getRecipeBySlug(slug: string) {
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      `
      *,
      ingredients(*),
      directions(*),
      recipe_nutrition(*),
      recipe_categories(category:categories(id, slug, name_sr))
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !recipe) return null;

  const recipeId = recipe.id;

  // Fetch ingredients and directions explicitly (embedded select can be unreliable)
  const [ingredientsRes, directionsRes] = await Promise.all([
    supabase.from("ingredients").select("*").eq("recipe_id", recipeId).order("sort_order"),
    supabase.from("directions").select("*").eq("recipe_id", recipeId).order("sort_order"),
  ]);

  const ingredients = ingredientsRes.data ?? [];
  const directions = directionsRes.data ?? [];

  // Get rating aggregate (Supabase doesn't have built-in avg, so we fetch)
  const { data: ratings } = await supabase
    .from("ratings")
    .select("stars")
    .eq("recipe_id", recipeId);
  const ratingCount = ratings?.length ?? 0;
  const ratingAvg =
    ratingCount > 0
      ? ratings!.reduce((s, r) => s + r.stars, 0) / ratingCount
      : null;

  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId)
    .eq("status", "approved");

  return {
    ...recipe,
    ingredients,
    directions,
    rating_avg: ratingAvg,
    rating_count: ratingCount,
    review_count: reviewCount ?? 0,
  };
}

export async function getFeaturedRecipesWithReviews(limit = 6) {
  const supabase = await createClient();

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
      author_name
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !recipes?.length) return [];

  const recipeIds = recipes.map((r) => r.id);

  // Fetch one review per recipe (first by created_at), approved only
  const { data: reviews } = await supabase
    .from("reviews")
    .select("recipe_id, content")
    .in("recipe_id", recipeIds)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const reviewByRecipe: Record<string, string> = {};
  for (const r of reviews || []) {
    if (!reviewByRecipe[r.recipe_id]) {
      reviewByRecipe[r.recipe_id] = r.content;
    }
  }

  // Fetch ratings for aggregate
  const { data: ratings } = await supabase
    .from("ratings")
    .select("recipe_id, stars")
    .in("recipe_id", recipeIds);

  const ratingByRecipe: Record<string, { count: number; avg: number }> = {};
  for (const r of recipeIds) {
    ratingByRecipe[r] = { count: 0, avg: 0 };
  }
  for (const row of ratings || []) {
    const curr = ratingByRecipe[row.recipe_id];
    if (!curr) continue;
    curr.count += 1;
    curr.avg += row.stars;
  }
  for (const r of recipeIds) {
    const curr = ratingByRecipe[r];
    if (curr.count > 0) curr.avg /= curr.count;
  }

  return recipeIds.map((id) => {
    const r = recipes.find((x) => x.id === id)!;
    const rStats = ratingByRecipe[id] || { count: 0, avg: 0 };
    return {
      ...r,
      rating_count: rStats.count,
      rating_avg: rStats.count > 0 ? rStats.avg : null,
      review_quote: reviewByRecipe[id] || null,
    };
  });
}

export async function getSectionRecipes(categorySlug: string | null, limit = 6) {
  const recipes = await getPublishedRecipes(limit, 0, categorySlug ? { categorySlug } : undefined);
  if (recipes.length === 0) return [];
  const supabase = await createClient();
  const recipeIds = recipes.map((r) => r.id);
  const { data: ratings } = await supabase
    .from("ratings")
    .select("recipe_id, stars")
    .in("recipe_id", recipeIds);
  const ratingByRecipe: Record<string, { count: number; avg: number }> = {};
  for (const id of recipeIds) ratingByRecipe[id] = { count: 0, avg: 0 };
  for (const row of ratings || []) {
    const curr = ratingByRecipe[row.recipe_id];
    if (!curr) continue;
    curr.count += 1;
    curr.avg += row.stars;
  }
  for (const id of recipeIds) {
    const curr = ratingByRecipe[id];
    if (curr.count > 0) curr.avg /= curr.count;
  }
  return recipes.map((r) => ({
    ...r,
    rating_count: ratingByRecipe[r.id].count,
    rating_avg: ratingByRecipe[r.id].count > 0 ? ratingByRecipe[r.id].avg : null,
  }));
}

export async function getRelatedRecipes(
  recipeId: string,
  categoryIds: string[],
  limit = 8
) {
  if (categoryIds.length === 0) return [];

  const supabase = await createClient();
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
      category:categories(name_sr)
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
  const seen = new Set<string>();
  const recipeMap = new Map<
    string,
    RecipeRow & { categoryName?: string; rating_avg?: number | null; rating_count?: number }
  >();

  for (const row of data || []) {
    const raw = row as unknown as {
      recipe_id: string;
      recipe?: RecipeRow | RecipeRow[];
      category?: { name_sr: string } | { name_sr: string }[];
    };
    const r = Array.isArray(raw.recipe) ? raw.recipe[0] : raw.recipe;
    if (!r) continue;

    const cat = Array.isArray(raw.category) ? raw.category[0] : raw.category;
    const categoryName = cat?.name_sr ?? undefined;

    if (!recipeMap.has(r.id)) {
      seen.add(r.id);
      recipeMap.set(r.id, { ...r, categoryName });
    } else {
      const existing = recipeMap.get(r.id)!;
      if (!existing.categoryName && categoryName) existing.categoryName = categoryName;
    }
    if (recipeMap.size >= limit) break;
  }

  const recipeIds = [...recipeMap.keys()];
  if (recipeIds.length === 0) return [...recipeMap.values()];

  const { data: ratings } = await supabase
    .from("ratings")
    .select("recipe_id, stars")
    .in("recipe_id", recipeIds);

  const ratingByRecipe: Record<string, { count: number; sum: number }> = {};
  for (const id of recipeIds) ratingByRecipe[id] = { count: 0, sum: 0 };
  for (const row of ratings || []) {
    const curr = ratingByRecipe[row.recipe_id];
    if (curr) {
      curr.count += 1;
      curr.sum += row.stars;
    }
  }

  return recipeIds.map((id) => {
    const recipe = recipeMap.get(id)!;
    const r = ratingByRecipe[id];
    const rating_count = r?.count ?? 0;
    const rating_avg = rating_count > 0 ? r!.sum / rating_count : null;
    return { ...recipe, rating_avg, rating_count };
  });
}
