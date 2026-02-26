import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFilterCategories } from "@/lib/queries/recipes";
import { AddRecipeForm } from "@/components/AddRecipeForm";

export default async function NewRecipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/recepti/novo");
  }

  const categories = await getFilterCategories();

  return (
    <div className="mx-auto max-w-[1220px]">
      <h1 className="text-2xl font-bold text-[var(--ar-gray-900)]">
        Novi recept
      </h1>
      <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
        Popunite podatke i objavite recept.
      </p>
      <div className="mt-8">
        <AddRecipeForm userId={user.id} categories={categories} />
      </div>
    </div>
  );
}
