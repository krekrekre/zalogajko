import { redirect, permanentRedirect } from "next/navigation";
import Link from "next/link";
import {
  getRecipeBySlug,
  getRecipeCanonicalPath,
  getFilterCategories,
  getPublishedRecipes,
} from "@/lib/queries/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { CategoryPageFilters } from "@/components/recipes/CategoryPageFilters";
import { getListingMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getFilterCategories();
  const mealCategory = categories.find((c) => c.slug === slug && c.type === "meal_type");
  const cuisineCategory = categories.find((c) => c.slug === slug && c.type === "cuisine");
  const category = mealCategory ?? cuisineCategory;
  if (!category) return {};
  // Cuisine pages are canonical at /kuhinja/[slug]
  const path = cuisineCategory ? `/kuhinja/${slug}` : `/recepti/${slug}`;
  return getListingMetadata({
    title: category.name_sr,
    description: `Pregledajte recepte u kategoriji ${category.name_sr}.`,
    path,
  });
}

export default async function ReceptiSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const raw = await searchParams;
  const tezina = typeof raw?.tezina === "string" ? raw.tezina : undefined;
  const vreme = typeof raw?.vreme === "string" ? raw.vreme : undefined;

  const recipe = await getRecipeBySlug(slug);
  if (recipe) {
    permanentRedirect(getRecipeCanonicalPath(recipe));
  }

  const categories = await getFilterCategories();
  const category =
    categories.find((c) => c.slug === slug && c.type === "meal_type") ??
    categories.find((c) => c.slug === slug && c.type === "cuisine");
  if (!category) {
    redirect("/recepti");
  }

  // Cuisine categories live under /kuhinja; redirect so one canonical URL per cuisine
  if (category.type === "cuisine") {
    const params = new URLSearchParams();
    if (tezina) params.set("tezina", tezina);
    if (vreme) params.set("vreme", vreme);
    const q = params.toString();
    permanentRedirect(q ? `/kuhinja/${slug}?${q}` : `/kuhinja/${slug}`);
  }

  const isMealType = category.type === "meal_type";
  const skillLevel =
    tezina === "lako" || tezina === "srednje" || tezina === "tesko"
      ? (tezina as "lako" | "srednje" | "tesko")
      : undefined;
  let maxTimeMinutes: number | undefined;
  let minTimeMinutes: number | undefined;
  if (vreme === "do-30") maxTimeMinutes = 30;
  else if (vreme === "do-60") maxTimeMinutes = 60;
  else if (vreme === "do-120") maxTimeMinutes = 120;
  else if (vreme === "120-plus") minTimeMinutes = 121;

  const recipes = await getPublishedRecipes(100, 0, {
    ...(isMealType ? { categorySlug: slug } : { cuisineSlug: slug }),
    skillLevel,
    maxTimeMinutes,
    minTimeMinutes,
  });

  const breadcrumbItems = [
    { name: "Recepti", path: "/recepti" },
    { name: category.name_sr, path: `/recepti/${slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-[var(--ar-gray-600)]" aria-label="Breadcrumb">
          <Link href="/recepti" className="hover:text-[var(--color-primary)]">
            Recepti
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--ar-gray-900)]" aria-current="page">
            {category.name_sr}
          </span>
        </nav>
        <h1 className="font-display text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
          {category.name_sr}
        </h1>
        <CategoryPageFilters
          categorySlug={slug}
          activeTezina={tezina}
          activeVreme={vreme}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              slug={r.slug}
              title={r.title_sr}
              imageUrl={r.image_url}
              prepTime={r.prep_time_minutes}
              cookTime={r.cook_time_minutes}
              ratingCount={r.rating_count ?? 0}
              ratingAvg={r.rating_avg}
              categorySlug={isMealType ? slug : undefined}
            />
          ))}
        </div>
        {recipes.length === 0 && (
          <p className="py-12 text-center text-[var(--ar-gray-500)]">
            Nema recepta u ovoj kategoriji još uvek.
          </p>
        )}
      </div>
    </>
  );
}
