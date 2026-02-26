"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteRecipe(recipeId: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "Niste ulogovani.";

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) return "Nemate pravo da obrišete recept.";

  const { error } = await supabase.from("recipes").delete().eq("id", recipeId);
  if (error) return error.message;

  revalidatePath("/");
  revalidatePath("/recepti");
  revalidatePath("/admin");
  revalidatePath("/admin/recipes");
  return null;
}
