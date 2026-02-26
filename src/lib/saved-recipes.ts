import { createClient } from "@/lib/supabase/client";

const TABLE = "saved_recipes";

/**
 * Check if the current user has saved a recipe.
 * Returns false if not logged in or table missing.
 */
export async function isRecipeSaved(recipeId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from(TABLE)
    .select("recipe_id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

/**
 * Toggle save state for a recipe. Returns the new saved state, or null if not logged in / error.
 */
export async function toggleSavedRecipe(recipeId: string): Promise<boolean | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const existing = await supabase
    .from(TABLE)
    .select("recipe_id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (existing.error) return null;

  if (existing.data) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);
    return error ? null : false;
  }

  const { error } = await supabase.from(TABLE).insert({
    user_id: user.id,
    recipe_id: recipeId,
  });
  return error ? null : true;
}

/**
 * Get all recipe IDs the current user has saved.
 */
export async function getSavedRecipeIds(): Promise<Set<string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from(TABLE)
    .select("recipe_id")
    .eq("user_id", user.id);

  if (error) return new Set();
  return new Set((data || []).map((r) => r.recipe_id));
}
