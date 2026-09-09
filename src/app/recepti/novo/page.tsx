import { requireUser } from "@/lib/auth/server";
import { getFilterCategories } from "@/lib/queries/recipes";
import { NewRecipeView } from "./NewRecipeView";

export default async function NewRecipePage() {
  await requireUser("/recepti/novo");
  const categories = await getFilterCategories();

  // The heading lives in the client view because it has to disappear once the
  // recipe is submitted, and only the form knows when that happened.
  return (
    <div className="pb-12">
      <NewRecipeView categories={categories} />
    </div>
  );
}
