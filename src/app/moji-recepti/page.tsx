import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";
import { RecipeCard } from "@/components/RecipeCard";

export const metadata = {
  title: "Moji recepti | Recepti",
};

type Recipe = {
  id: string;
  slug: string;
  title_sr: string;
  image_url: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
};

export default async function MojiReceptiPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list: selectedListId } = await searchParams;
  const user = await requireUser("/moji-recepti");
  const supabase = await createClient();

  const [listsRes, savedRes] = await Promise.all([
    supabase
      .from("saved_recipe_lists")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("saved_recipes")
      .select("recipe_id, list_id")
      .eq("user_id", user.id),
  ]);

  const lists = listsRes.data ?? [];
  const saved = savedRes.data ?? [];

  const recipeIdsByListId = new Map<string, string[]>();
  for (const row of saved) {
    const arr = recipeIdsByListId.get(row.list_id) ?? [];
    arr.push(row.recipe_id);
    recipeIdsByListId.set(row.list_id, arr);
  }

  const allRecipeIds = [...new Set(saved.map((r) => r.recipe_id))];
  const recipesMap = new Map<string, Recipe>();
  if (allRecipeIds.length > 0) {
    const { data: recipesData } = await supabase
      .from("recipes")
      .select("id, slug, title_sr, image_url, prep_time_minutes, cook_time_minutes")
      .in("id", allRecipeIds)
      .eq("status", "published");
    for (const r of recipesData ?? []) {
      recipesMap.set(r.id, r as Recipe);
    }
  }

  const totalSaved = allRecipeIds.length;

  const listsToShow = selectedListId
    ? lists.filter((l) => l.id === selectedListId)
    : lists;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Moji sačuvani recepti</h1>

      {lists.length > 0 && totalSaved > 0 && (
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Filter po kategoriji">
          <Link
            href="/moji-recepti"
            className={`inline-block rounded-none border px-3 py-1.5 text-sm font-medium transition-colors ${
              !selectedListId
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-primary)]"
                : "border-[var(--ar-gray-300)] bg-white text-[var(--color-primary)] hover:border-[var(--color-accent)] hover:bg-[var(--ar-gray-50)]"
            }`}
          >
            Sve
          </Link>
          {lists.map((list) => {
            const count = (recipeIdsByListId.get(list.id) ?? []).length;
            if (count === 0) return null;
            const isSelected = selectedListId === list.id;
            return (
              <Link
                key={list.id}
                href={`/moji-recepti?list=${encodeURIComponent(list.id)}`}
                className={`inline-block rounded-none border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-primary)]"
                    : "border-[var(--ar-gray-300)] bg-white text-[var(--color-primary)] hover:border-[var(--color-accent)] hover:bg-[var(--ar-gray-50)]"
                }`}
              >
                {list.name} ({count})
              </Link>
            );
          })}
        </nav>
      )}

      {lists.length === 0 && totalSaved === 0 && (
        <div className="mt-8 py-16 text-center">
          <p className="text-gray-500">Niste sačuvali nijedan recept.</p>
          <Link
            href="/recepti"
            className="mt-4 inline-block text-orange-600 hover:text-orange-700"
          >
            Pregledaj recepte →
          </Link>
        </div>
      )}

      {lists.length > 0 && (
        <div className="mt-8 space-y-10">
          {listsToShow.map((list) => {
            const recipeIds = recipeIdsByListId.get(list.id) ?? [];
            const recipesInList = recipeIds
              .map((id) => recipesMap.get(id))
              .filter((r): r is Recipe => r != null);
            if (recipesInList.length === 0) return null;
            return (
              <section key={list.id}>
                <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
                  {list.name}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {recipesInList.map((r) => (
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
              </section>
            );
          })}
        </div>
      )}

      {lists.length === 0 && totalSaved > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from(recipesMap.values()).map((r) => (
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
      )}
    </div>
  );
}
