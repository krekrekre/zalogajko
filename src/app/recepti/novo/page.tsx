import { requireUser } from "@/lib/auth/server";
import { getFilterCategories } from "@/lib/queries/recipes";
import { AddRecipeForm } from "@/components/AddRecipeForm";

export default async function NewRecipePage() {
  await requireUser("/recepti/novo");
  const categories = await getFilterCategories();

  return (
    <div className="pb-12">
      {/* Cream band, the same one the home page uses behind "Najnovije".
          The header's desktop nav carries mb-8 for every other page, so pull
          that back here to sit the band flush under it. The nav is hidden
          below md, where there is no gap to close. */}
      <div className="border-b border-[var(--ar-gray-200)] bg-[#f1f1e6] md:-mt-8">
        <div className="mx-auto max-w-[1060px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-[760px]">
            <h1 className="break-words text-3xl font-bold leading-tight text-[var(--ar-gray-900)] sm:text-4xl lg:text-[46px]">
              Dodajte novi recept
            </h1>
            <p className="mt-4 max-w-[60ch] leading-relaxed text-[var(--ar-gray-700)]">
              Popunite podatke i objavite recept. Svaki deo forme stoji tačno
              tamo gde će stajati i na objavljenoj strani recepta.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1060px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[760px]">
          <AddRecipeForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
