import { getFilterCategories, getPublishedRecipes } from "@/lib/queries/recipes";
import { getListingMetadata } from "@/lib/seo";
import { CategoryRecipeSection } from "@/components/recipes/CategoryRecipeSection";

// Public, read-only page: serve from cache and refresh in the background.
export const revalidate = 900;

export const metadata = getListingMetadata({
  title: "Kuhinja",
  description:
    "Pregledajte recepte po kuhinji: srpska, italijanska, francuska i druge. Filtrirajte po kategoriji kuhinje.",
  path: "/kuhinja",
});

export default async function KuhinjaPage() {
  let cuisines: Awaited<ReturnType<typeof getFilterCategories>> = [];

  try {
    const all = await getFilterCategories();
    cuisines = all.filter((c) => c.type === "cuisine");
  } catch {
    cuisines = [];
  }

  const cuisineRecipes = await Promise.all(
    cuisines.map(async (c) => {
      const recipes = await getPublishedRecipes(100, 0, { cuisineSlug: c.slug });
      return { category: c, recipes };
    })
  );

  return (
    <div>
      <div className="mx-auto max-w-[1220px] px-8 py-10">
        <header className="text-center">
          <h1 className="font-display text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
            Kuhinja
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-base text-[var(--ar-gray-700)]">
            Recepti po tipu kuhinje — srpska, italijanska, francuska i ostale. Izaberite kuhinju i
            pregledajte recepte.
          </p>
        </header>
      </div>

      {cuisines.length > 0 && (
        <div className="sticky top-0 z-10 border-b border-[var(--ar-gray-200)] bg-white py-4">
          <div className="mx-auto max-w-[1220px] px-8">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {cuisines.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.slug}`}
                  className="rounded-none px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors bg-[var(--ar-gray-200)] text-[var(--ar-gray-700)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--ar-primary-ink)]"
                >
                  {c.slug.charAt(0).toUpperCase() + c.slug.slice(1)}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {cuisineRecipes.map(({ category, recipes }, index) => (
        <CategoryRecipeSection
          key={category.id}
          title={category.slug.charAt(0).toUpperCase() + category.slug.slice(1)}
          slug={category.slug}
          recipes={recipes}
          variant={index % 2 === 0 ? "white" : "cream"}
          basePath="/kuhinja"
        />
      ))}
    </div>
  );
}
