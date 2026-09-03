import { requireUser } from "@/lib/auth/server";
import { getFilterCategories } from "@/lib/queries/recipes";
import { AddRecipeForm } from "@/components/AddRecipeForm";

export default async function NewRecipePage() {
  await requireUser("/recepti/novo");
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
        <AddRecipeForm categories={categories} />
      </div>
    </div>
  );
}
