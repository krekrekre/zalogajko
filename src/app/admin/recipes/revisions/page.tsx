import { createClient } from "@/lib/supabase/server";
import { getAuthorDisplayName } from "@/lib/profile";
import {
  AdminRevisionsList,
  type RevisionDirection,
  type RevisionIngredient,
  type RevisionRow,
} from "./AdminRevisionsList";

const TABS = [
  { value: "pending", label: "Na čekanju" },
  { value: "approved", label: "Primenjene" },
  { value: "denied", label: "Odbijene" },
] as const;

type RecipeRef = { id: string; title_sr: string; slug: string };

function asIngredients(value: unknown): RevisionIngredient[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      amount: (r.amount as string | null) ?? null,
      unit_sr: (r.unit_sr as string | null) ?? null,
      name_sr: String(r.name_sr ?? ""),
    };
  });
}

function asDirections(value: unknown): RevisionDirection[] {
  if (!Array.isArray(value)) return [];
  return value.map((row, index) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      step_number: Number(r.step_number ?? index + 1),
      instruction_sr: String(r.instruction_sr ?? ""),
    };
  });
}

export default async function AdminRevisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter =
    status === "approved" || status === "denied" ? status : "pending";

  const supabase = await createClient();
  const { data: revisions, error } = await supabase
    .from("recipe_revisions")
    .select(
      `
      id,
      recipe_id,
      author_id,
      payload,
      status,
      created_at,
      recipe:recipes(id, title_sr, slug)
    `,
    )
    .eq("status", filter)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-600">Greška pri učitavanju: {error.message}</div>
    );
  }

  const rows: RevisionRow[] = await Promise.all(
    (revisions ?? []).map(async (r) => {
      const recipeRaw = r.recipe as unknown;
      const recipeObj = Array.isArray(recipeRaw) ? recipeRaw[0] : recipeRaw;
      const recipe = (recipeObj ?? null) as RecipeRef | null;

      // The live content, so the queue shows what the edit would replace.
      const [{ data: ingredients }, { data: directions }] = await Promise.all([
        supabase
          .from("ingredients")
          .select("amount, unit_sr, name_sr")
          .eq("recipe_id", r.recipe_id)
          .order("sort_order"),
        supabase
          .from("directions")
          .select("step_number, instruction_sr")
          .eq("recipe_id", r.recipe_id)
          .order("sort_order"),
      ]);

      const payload = (r.payload ?? {}) as Record<string, unknown>;

      return {
        id: r.id,
        recipe_id: r.recipe_id,
        status: r.status,
        created_at: r.created_at,
        recipe_title: recipe?.title_sr ?? "Recept",
        recipe_slug: recipe?.slug ?? r.recipe_id,
        author_name: await getAuthorDisplayName(r.author_id),
        current: {
          ingredients: asIngredients(ingredients),
          directions: asDirections(directions),
        },
        proposed: {
          ingredients: asIngredients(payload.ingredients),
          directions: asDirections(payload.directions),
        },
      };
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ar-gray-900)]">
        Izmene recepata
      </h1>
      <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
        Izmene objavljenih recepata čekaju odobrenje. Do tada na sajtu ostaje
        postojeća verzija.
      </p>
      <div className="mt-4 flex gap-2 border-b border-[var(--ar-gray-200)]">
        {TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/recipes/revisions?status=${tab.value}`}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              filter === tab.value
                ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
                : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>
      <AdminRevisionsList revisions={rows} currentFilter={filter} />
    </div>
  );
}
