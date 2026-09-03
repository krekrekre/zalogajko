"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server";
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
