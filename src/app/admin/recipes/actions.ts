"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server";
import { getRecipeCanonicalPath } from "@/lib/recipe-path";
import { revalidatePath } from "next/cache";

export async function deleteRecipe(recipeId: string): Promise<string | null> {
  await requireAdmin("/admin/recipes");
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", recipeId);
  if (error) return error.message;

  revalidatePath("/");
  revalidatePath("/recepti");
  revalidatePath("/admin");
  revalidatePath("/admin/recipes");
  return null;
}

async function setRecipeStatus(
  recipeId: string,
  status: "published" | "denied",
): Promise<string | null> {
  const user = await requireAdmin("/admin/recipes");
  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("recipes")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", recipeId)
    .select(
      "slug, recipe_categories(category:categories(id, slug, type, sort_order))",
    )
    .single();
  if (error) return error.message;

  // Approving puts the recipe on the public pages; denying takes it off them.
  // Its own page is cached under the canonical path, which the listing paths
  // do not cover.
  revalidatePath("/");
  revalidatePath("/recepti");
  revalidatePath("/kategorije");
  revalidatePath("/kuhinja");
  if (updated?.slug) {
    revalidatePath(
      getRecipeCanonicalPath(
        updated as unknown as Parameters<typeof getRecipeCanonicalPath>[0],
      ),
    );
  }
  revalidatePath("/admin");
  revalidatePath("/admin/recipes");
  return null;
}

export async function approveRecipe(recipeId: string): Promise<string | null> {
  return setRecipeStatus(recipeId, "published");
}

export async function denyRecipe(recipeId: string): Promise<string | null> {
  return setRecipeStatus(recipeId, "denied");
}
