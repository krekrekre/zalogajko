import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ChefHat } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

export const metadata = {
  title: "Pregled recepta | Admin",
};

const SKILL_LEVEL_LABELS: Record<string, string> = {
  lako: "Lako",
  srednje: "Srednje",
  tesko: "Teško",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Čeka odobrenje",
  published: "Objavljen",
  denied: "Odbijen",
  draft: "Radna verzija",
};

type Ingredient = {
  amount: string | null;
  unit_sr: string | null;
  name_sr: string;
  sort_order: number | null;
};

type Direction = {
  step_number: number | null;
  instruction_sr: string;
  sort_order: number | null;
  image_url: string | null;
};

/**
 * The public recipe page cannot show this: it reads through the anonymous
 * client and filters status = 'published', which is what keeps it statically
 * cacheable. An admin judging a recipe before approving it needs the whole
 * thing, so this reads through the cookie-backed client instead and lets the
 * "Admins can read all recipes" policy decide.
 */
export default async function AdminRecipePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireAdmin("/admin/recipes");
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      `*, recipe_nutrition(*), recipe_categories(category:categories(id, slug, name_sr, type))`,
    )
    .eq("slug", slug)
    .single();

  if (!recipe) notFound();

  const [{ data: ingredientsData }, { data: directionsData }] =
    await Promise.all([
      supabase
        .from("ingredients")
        .select("amount, unit_sr, name_sr, sort_order")
        .eq("recipe_id", recipe.id)
        .order("sort_order"),
      supabase
        .from("directions")
        .select("step_number, instruction_sr, sort_order, image_url")
        .eq("recipe_id", recipe.id)
        .order("sort_order"),
    ]);

  const ingredients = (ingredientsData ?? []) as Ingredient[];
  const directions = (directionsData ?? []) as Direction[];
  const nutrition = recipe.recipe_nutrition as
    | { calories: number | null; fat_g: number | null; carbs_g: number | null; protein_g: number | null }
    | null;
  const categories = (recipe.recipe_categories || [])
    .map((rc: { category?: { name_sr: string } }) => rc.category?.name_sr)
    .filter(Boolean) as string[];
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <div className="mx-auto max-w-[1060px] px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/recipes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ar-primary-ink)] hover:text-[var(--ar-primary-ink-hover)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Nazad na recepte
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="border border-[var(--ar-gray-300)] bg-[var(--ar-cream)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--ar-gray-700)]">
          {STATUS_LABELS[recipe.status] ?? recipe.status}
        </span>
        {categories.map((c) => (
          <span key={c} className="text-xs uppercase tracking-wide text-[var(--ar-gray-600)]">
            {c}
          </span>
        ))}
      </div>

      <div className="max-w-[760px]">
        <h1 className="mt-3 break-words text-3xl font-bold leading-tight text-[var(--ar-gray-900)] sm:text-4xl">
          {recipe.title_sr}
        </h1>
        <p className="mt-2 text-sm text-[var(--ar-gray-600)]">
          Autor: {recipe.author_name || "Domaći kuvar"} • Poslato:{" "}
          {new Date(recipe.created_at).toLocaleString("sr-RS")}
        </p>

        {recipe.description_sr && (
          <p className="mt-4 whitespace-pre-line break-words leading-relaxed text-[var(--ar-gray-700)]">
            {recipe.description_sr}
          </p>
        )}

        <div className="relative mt-6 aspect-[4/3] w-full max-w-[520px] overflow-hidden border border-[var(--ar-gray-200)]">
          <Image
            src={recipe.image_url || PLACEHOLDER_IMAGES.default}
            alt={recipe.title_sr}
            fill
            sizes="520px"
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="mt-6 overflow-hidden border border-[color:color-mix(in_srgb,black_20%,transparent)] border-t-12 border-t-[color:color-mix(in_srgb,#d84316_20%,transparent)] bg-white p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-4">
            <div>
              <p className="text-sm font-bold text-[var(--ar-gray-900)]">Aktivno vreme:</p>
              <p className="text-sm text-[var(--ar-gray-700)]">{recipe.prep_time_minutes} min</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--ar-gray-900)]">Ukupno vreme:</p>
              <p className="text-sm text-[var(--ar-gray-700)]">{totalTime} min</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--ar-gray-900)]">Porcije:</p>
              <p className="text-sm text-[var(--ar-gray-700)]">{recipe.servings}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--ar-gray-900)]">Težina:</p>
              <p className="text-sm text-[var(--ar-gray-700)]">
                {recipe.skill_level
                  ? SKILL_LEVEL_LABELS[recipe.skill_level] ?? recipe.skill_level
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {recipe.why_youll_love && recipe.why_youll_love.length > 0 && (
          <div className="relative mt-8 border border-[var(--ar-primary-ink)] px-5 pb-6 pt-9 sm:px-8 sm:pb-8">
            <h2 className="absolute left-1/2 top-0 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-center text-[13px] font-bold uppercase leading-tight tracking-[0.12em] text-[var(--ar-primary-ink)]">
              Zašto ćete voleti ovaj recept
            </h2>
            <ul className="space-y-4 text-base leading-relaxed text-[var(--color-primary)]">
              {recipe.why_youll_love.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ar-primary)]"
                    aria-hidden
                  />
                  <span className="min-w-0 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="mt-10 text-2xl font-semibold text-[var(--ar-gray-700)]">
          Sastojci{" "}
          <span className="text-base font-normal text-[var(--ar-gray-500)]">
            ({ingredients.length})
          </span>
        </h2>
        {ingredients.length > 0 ? (
          <ul className="mt-4 space-y-2 text-base">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 wrap-anywhere text-[var(--ar-gray-700)]">
                {ing.amount && <span>{ing.amount}</span>}
                {ing.unit_sr && <span>{ing.unit_sr}</span>}
                <span>{ing.name_sr}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--ar-heart-red)]">
            Recept nema unetih sastojaka.
          </p>
        )}

        <h2 className="mt-10 text-2xl font-semibold text-[var(--ar-gray-700)]">
          Uputstvo{" "}
          <span className="text-base font-normal text-[var(--ar-gray-500)]">
            ({directions.length})
          </span>
        </h2>
        {directions.length > 0 ? (
          <ol className="mt-4 list-none space-y-6 pl-0">
            {directions.map((step, i) => (
              <li key={i} className="text-base text-[var(--ar-gray-700)]">
                <span className="inline-block border-b-2 border-[var(--ar-primary)] pb-1 font-semibold text-[var(--ar-gray-900)]">
                  {step.step_number ?? i + 1}. korak
                </span>
                <p className="mt-3 whitespace-pre-line break-words">
                  {step.instruction_sr}
                </p>
                {step.image_url && (
                  <div className="relative mt-3 aspect-[4/3] w-full max-w-[320px] overflow-hidden border border-[var(--ar-gray-200)]">
                    <Image
                      src={step.image_url}
                      alt={`Korak ${step.step_number ?? i + 1}`}
                      fill
                      sizes="320px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-[var(--ar-heart-red)]">
            Recept nema unetih koraka pripreme.
          </p>
        )}

        {recipe.chef_tip_sr?.trim() && (
          <div className="mt-8 border border-[var(--ar-gray-200)] border-l-4 border-l-[var(--ar-primary)] bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              <ChefHat className="h-5 w-5 shrink-0 text-[var(--ar-primary-ink)]" aria-hidden />
              Savet kuvara
            </h2>
            <p className="mt-3 whitespace-pre-line break-words leading-relaxed text-[var(--color-primary)]">
              {recipe.chef_tip_sr}
            </p>
          </div>
        )}

        {nutrition && (
          <>
            <h2 className="mt-10 text-2xl font-semibold text-[var(--ar-gray-700)]">
              Nutritivne vrednosti
            </h2>
            <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ["Kalorije", nutrition.calories, "kcal"],
                ["Masti", nutrition.fat_g, "g"],
                ["Ugljeni hidrati", nutrition.carbs_g, "g"],
                ["Proteini", nutrition.protein_g, "g"],
              ].map(([label, value, unit]) => (
                <div key={String(label)}>
                  <p className="text-xl font-bold text-[var(--ar-gray-900)]">
                    {value ?? "—"}
                    {value != null ? ` ${unit}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ar-gray-700)]">{String(label)}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="mt-10 border-t border-[var(--ar-gray-200)] pt-6 text-sm text-[var(--ar-gray-600)]">
          Odobravanje i odbijanje su na{" "}
          <Link
            href="/admin/recipes"
            className="font-medium text-[var(--ar-primary-ink)] underline decoration-[var(--color-accent)] hover:no-underline"
          >
            listi recepata
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
