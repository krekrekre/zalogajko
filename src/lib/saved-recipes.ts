import { createClient } from "@/lib/supabase/client";

const SAVED_RECIPES_TABLE = "saved_recipes";
const LISTS_TABLE = "saved_recipe_lists";

export type SavedRecipeList = { id: string; name: string };

/**
 * Check if the current user has saved a recipe (in any list).
 */
export async function isRecipeSaved(recipeId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from(SAVED_RECIPES_TABLE)
    .select("recipe_id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}

/**
 * Get the user's save lists (categories). Returns [] if not logged in.
 */
export async function getSavedRecipeLists(): Promise<SavedRecipeList[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from(LISTS_TABLE)
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

/**
 * Create a new save list. Returns the new list or null if not logged in / error.
 */
export async function createSavedRecipeList(name: string): Promise<SavedRecipeList | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from(LISTS_TABLE)
    .insert({ user_id: user.id, name: name.trim() })
    .select("id, name")
    .single();

  if (error) return null;
  return data;
}

/**
 * Save a recipe to a list. Returns true on success.
 */
export async function saveRecipeToList(recipeId: string, listId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from(SAVED_RECIPES_TABLE).insert({
    user_id: user.id,
    recipe_id: recipeId,
    list_id: listId,
  });
  return !error;
}

/**
 * Remove a recipe from all of the user's lists (unsave).
 */
export async function unsaveRecipe(recipeId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from(SAVED_RECIPES_TABLE)
    .delete()
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId);
  return !error;
}

/**
 * Toggle save state for a recipe. If not saved, opens UI to pick list (caller shows dropdown).
 * Returns the new saved state, or null if not logged in / error.
 * @deprecated Prefer saveRecipeToList + unsaveRecipe with dropdown for choosing list.
 */
export async function toggleSavedRecipe(recipeId: string): Promise<boolean | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from(SAVED_RECIPES_TABLE)
    .select("recipe_id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .limit(1);

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from(SAVED_RECIPES_TABLE)
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);
    return error ? null : false;
  }

  const lists = await getSavedRecipeLists();
  const listId = lists.length > 0 ? lists[0].id : null;
  if (!listId) {
    const newList = await createSavedRecipeList("Sačuvano");
    if (!newList) return null;
    const ok = await saveRecipeToList(recipeId, newList.id);
    return ok ? true : null;
  }

  const ok = await saveRecipeToList(recipeId, listId);
  return ok ? true : null;
}

/**
 * Get all recipe IDs the current user has saved (in any list).
 */
export async function getSavedRecipeIds(): Promise<Set<string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from(SAVED_RECIPES_TABLE)
    .select("recipe_id")
    .eq("user_id", user.id);

  if (error) return new Set();
  return new Set((data || []).map((r) => r.recipe_id));
}
