import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Moji objavljeni recepti | Recepti",
};

type AuthoredRecipe = {
  id: string;
  slug: string;
  title_sr: string;
  created_at: string;
  updated_at: string;
  status: string;
};

export default async function AuthoredRecipesPage() {
  let user: { id: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/login?next=/moji-recepti/autorski");
  }
  if (!user) {
    redirect("/login?next=/moji-recepti/autorski");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("id, slug, title_sr, created_at, updated_at, status")
    .eq("author_id", user.id)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const recipes = (data || []) as AuthoredRecipe[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Moji objavljeni recepti</h1>
      <p className="mt-2 text-gray-600">
        Ovde možete brzo otvoriti i urediti svoje recepte.
      </p>

      {recipes.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-[var(--ar-gray-200)] bg-white">
          <ul className="divide-y divide-[var(--ar-gray-200)]">
            {recipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/recepti/${recipe.slug}`}
                    className="font-medium text-[var(--ar-gray-800)] hover:text-[var(--ar-primary)]"
                  >
                    {recipe.title_sr}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--ar-gray-500)]">
                    Ažurirano:{" "}
                    {new Date(recipe.updated_at).toLocaleDateString("sr-RS")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/recepti/${recipe.slug}`}
                    className="text-sm font-medium text-[var(--ar-gray-700)] hover:underline"
                  >
                    Otvori
                  </Link>
                  <Link
                    href={`/admin/recepti/${recipe.slug}/izmeni`}
                    className="text-sm font-semibold text-[var(--color-orange)] hover:underline"
                  >
                    Uredi
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-500">Nemate nijedan objavljen recept.</p>
          <Link
            href="/admin/recepti/novo"
            className="mt-4 inline-block text-orange-600 hover:text-orange-700"
          >
            Dodaj novi recept →
          </Link>
        </div>
      )}
    </div>
  );
}
