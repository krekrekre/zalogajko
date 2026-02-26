"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteRecipe } from "@/app/admin/recipes/actions";

type RecipeRow = {
  id: string;
  slug: string;
  title_sr: string;
  status: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
};

export function AdminRecipesList({ recipes }: { recipes: RecipeRow[] }) {
  const router = useRouter();

  async function handleDelete(recipe: RecipeRow) {
    const confirmed = window.confirm(
      `Da li ste sigurni da želite da obrišete recept "${recipe.title_sr}"? Ova radnja je trajna.`,
    );
    if (!confirmed) return;

    const err = await deleteRecipe(recipe.id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (recipes.length === 0) {
    return (
      <p className="mt-6 text-sm text-[var(--ar-gray-600)]">
        Nema recepata za prikaz.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-[var(--ar-gray-900)]">
                {recipe.title_sr}
              </p>
              <Link
                href={`/recepti/${recipe.slug}`}
                className="text-sm text-[var(--ar-primary)] hover:underline"
              >
                /recepti/{recipe.slug}
              </Link>
              <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
                Autor: {recipe.author_name || "Domaći kuvar"} • Status:{" "}
                {recipe.status || "unknown"}
              </p>
            </div>
            <span className="text-sm text-[var(--ar-gray-600)]">
              {new Date(recipe.created_at).toLocaleString("sr-RS")}
            </span>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => handleDelete(recipe)}
              className="cursor-pointer rounded-none border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Obriši recept
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
