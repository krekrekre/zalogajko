import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RecipeCard } from "@/components/RecipeCard";

export const metadata = {
  title: "Moji recepti | Recepti",
};

export default async function MojiReceptiPage() {
  let user: { id: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/login?next=/moji-recepti");
  }
  if (!user) {
    redirect("/login?next=/moji-recepti");
  }

  const supabase = await createClient();
  const { data: saved } = await supabase
    .from("saved_recipes")
    .select("recipe_id")
    .eq("user_id", user.id);

  const recipeIds = (saved || []).map((r) => r.recipe_id);
  let recipes: Array<{
    id: string;
    slug: string;
    title_sr: string;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
  }> = [];

  if (recipeIds.length > 0) {
    const { data } = await supabase
      .from("recipes")
      .select("id, slug, title_sr, image_url, prep_time_minutes, cook_time_minutes")
      .in("id", recipeIds)
      .eq("status", "published");
    recipes = (data || []) as typeof recipes;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Moji sačuvani recepti</h1>
      <p className="mt-2 text-gray-600">
        Recepti koje ste sačuvali za kasnije.
      </p>
      <Link
        href="/moji-recepti/autorski"
        className="mt-3 inline-block text-sm font-medium text-[var(--color-orange)] hover:underline"
      >
        Pogledaj moje objavljene recepte →
      </Link>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((r) => (
          <RecipeCard
            key={r.id}
            slug={r.slug}
            title={r.title_sr}
            imageUrl={r.image_url}
            prepTime={r.prep_time_minutes}
            cookTime={r.cook_time_minutes}
          />
        ))}
      </div>
      {recipes.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-gray-500">Niste sačuvali nijedan recept.</p>
          <Link
            href="/recepti"
            className="mt-4 inline-block text-orange-600 hover:text-orange-700"
          >
            Pregledaj recepte →
          </Link>
        </div>
      )}
    </div>
  );
}
