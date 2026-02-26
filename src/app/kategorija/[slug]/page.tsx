import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RecipeCard } from "@/components/RecipeCard";
import { getListingMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name_sr")
    .eq("slug", slug)
    .single();
  if (!category) return {};
  return getListingMetadata(
    `Recepti: ${category.name_sr}`,
    `Pregledajte recepte u kategoriji ${category.name_sr}.`
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("id, slug, name_sr")
    .eq("slug", slug)
    .single();

  if (catError || !category) notFound();

  const { data: rcData } = await supabase
    .from("recipe_categories")
    .select("recipe_id")
    .eq("category_id", category.id);

  const recipeIds = (rcData || []).map((r) => r.recipe_id);
  let recipes: Awaited<ReturnType<typeof import("@/lib/queries/recipes").getPublishedRecipes>> = [];

  if (recipeIds.length > 0) {
    const { data } = await supabase
      .from("recipes")
      .select(
        "id, slug, title_sr, image_url, prep_time_minutes, cook_time_minutes"
      )
      .in("id", recipeIds)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    recipes = (data || []) as typeof recipes;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-600">
          Početna
        </Link>
        <span className="mx-2">/</span>
        <Link href="/kategorije" className="hover:text-orange-600">
          Kategorije
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{category.name_sr}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900">
        Recepti: {category.name_sr}
      </h1>
      <p className="mt-2 text-gray-600">
        {recipes.length} recepta u ovoj kategoriji.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            slug={recipe.slug}
            title={recipe.title_sr}
            imageUrl={recipe.image_url}
            prepTime={recipe.prep_time_minutes}
            cookTime={recipe.cook_time_minutes}
          />
        ))}
      </div>
      {recipes.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          Nema recepta u ovoj kategoriji još uvek.
        </p>
      )}
    </div>
  );
}
