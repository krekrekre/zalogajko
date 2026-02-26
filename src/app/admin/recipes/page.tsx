import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminRecipesList } from "./AdminRecipesList";

function getRecipesHref(status: string, q: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/recipes?${query}` : "/admin/recipes";
}

export default async function AdminRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const filter =
    status === "published" || status === "draft" ? status : "all";
  const searchTerm = (q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("recipes")
    .select("id, slug, title_sr, status, author_name, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  }
  if (searchTerm) {
    const like = `%${searchTerm.replace(/,/g, " ")}%`;
    query = query.or(
      `title_sr.ilike.${like},slug.ilike.${like},author_name.ilike.${like}`,
    );
  }

  const { data: recipes, error } = await query;

  if (error) {
    return (
      <div className="text-red-600">
        Greška pri učitavanju: {error.message}
      </div>
    );
  }

  const rows = (recipes ?? []).map((recipe) => ({
    id: recipe.id,
    slug: recipe.slug,
    title_sr: recipe.title_sr,
    status: recipe.status,
    author_name: recipe.author_name,
    created_at: recipe.created_at,
    updated_at: recipe.updated_at,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ar-gray-900)]">
        Recepti
      </h1>
      <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
        Brisanje recepata iz admin panela.
      </p>
      <div className="mt-4 flex gap-2 border-b border-[var(--ar-gray-200)]">
        <Link
          href={getRecipesHref("all", searchTerm)}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "all"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Svi
        </Link>
        <Link
          href={getRecipesHref("published", searchTerm)}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "published"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Published
        </Link>
        <Link
          href={getRecipesHref("draft", searchTerm)}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "draft"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Draft
        </Link>
      </div>
      <form action="/admin/recipes" method="get" className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={searchTerm}
            placeholder="Pretraga po nazivu, slugu ili autoru"
            className="w-full max-w-md border border-[var(--ar-gray-300)] bg-white px-3 py-2 text-sm text-[var(--ar-gray-900)] outline-none focus:border-[var(--ar-primary)]"
          />
          {filter !== "all" && (
            <input type="hidden" name="status" value={filter} />
          )}
          <button
            type="submit"
            className="cursor-pointer rounded-none bg-[var(--ar-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)]"
          >
            Pretraži
          </button>
          <Link
            href={getRecipesHref(filter, "")}
            className="text-sm text-[var(--ar-gray-600)] hover:underline"
          >
            Očisti pretragu
          </Link>
        </div>
      </form>
      <AdminRecipesList recipes={rows} />
    </div>
  );
}
