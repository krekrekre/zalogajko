"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server";
import { getRecipeCanonicalPath } from "@/lib/recipe-path";
import { revalidatePath } from "next/cache";

async function revalidateRecipe(recipeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("slug, recipe_categories(category:categories(id, slug, type, sort_order))")
    .eq("id", recipeId)
    .single();

  revalidatePath("/");
  revalidatePath("/recepti");
  if (data?.slug) {
    revalidatePath(
      getRecipeCanonicalPath(
        data as unknown as Parameters<typeof getRecipeCanonicalPath>[0],
      ),
    );
  }
  revalidatePath("/admin");
  revalidatePath("/admin/recipes/revisions");
}

/**
 * Applying replaces the live ingredients and directions in one transaction,
 * which is why it goes through the database function rather than a handful of
 * writes from here.
 */
export async function approveRevision(
  revisionId: string,
  recipeId: string,
): Promise<string | null> {
  await requireAdmin("/admin/recipes/revisions");
  const supabase = await createClient();

  const { error } = await supabase.rpc("apply_recipe_revision", {
    revision_id: revisionId,
  });
  if (error) return error.message;

  await revalidateRecipe(recipeId);
  return null;
}

export async function denyRevision(revisionId: string): Promise<string | null> {
  const user = await requireAdmin("/admin/recipes/revisions");
  const supabase = await createClient();

  const { error } = await supabase
    .from("recipe_revisions")
    .update({
      status: "denied",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", revisionId);
  if (error) return error.message;

  // The live recipe never changed, so only the queue needs refreshing.
  revalidatePath("/admin");
  revalidatePath("/admin/recipes/revisions");
  return null;
}
