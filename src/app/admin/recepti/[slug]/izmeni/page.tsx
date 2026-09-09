import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";
import { EditRecipeForm } from "@/components/EditRecipeForm";

export const metadata = {
  title: "Uredi recept | Recepti",
};

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser(`/admin/recepti/${slug}/izmeni`);
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("id, slug, title_sr, author_id, status, chef_tip_sr")
    .eq("slug", slug)
    .single();

  if (error || !recipe) notFound();
  if (recipe.author_id !== user.id) {
    redirect(`/recepti/${slug}`);
  }

  const [{ data: ingredients }, { data: directions }, { count: pendingCount }] =
    await Promise.all([
    supabase
      .from("ingredients")
      .select("amount, unit_sr, name_sr, sort_order")
      .eq("recipe_id", recipe.id)
      .order("sort_order"),
    supabase
      .from("directions")
      .select("instruction_sr, image_url, sort_order")
      .eq("recipe_id", recipe.id)
      .order("sort_order"),
    supabase
      .from("recipe_revisions")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", recipe.id)
      .eq("status", "pending"),
  ]);

  const pendingRevisions = pendingCount ?? 0;

  return (
    <div className="mx-auto max-w-[1060px] px-6 py-8">
      <Link
        href={`/recepti/${slug}`}
        className="text-sm text-[var(--color-orange)] hover:text-[var(--ar-primary-hover)]"
      >
        ← Nazad na recept
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-[var(--ar-gray-900)]">
        Uredi recept: {recipe.title_sr}
      </h1>
      <p className="mt-1 text-sm text-[var(--ar-gray-500)]">
        Ovde možete brzo ispraviti sastojke i korake pripreme.
      </p>

      {pendingRevisions > 0 && (
        <p className="mt-3 border border-[var(--ar-gray-300)] bg-[var(--ar-cream)] p-3 text-sm text-[var(--color-primary)]">
          Već imate {pendingRevisions === 1 ? "izmenu koja čeka" : "izmene koje čekaju"}{" "}
          odobrenje. Novo slanje dodaje još jedan predlog.
        </p>
      )}

      <EditRecipeForm
        recipeId={recipe.id}
        slug={recipe.slug}
        isPublished={recipe.status === "published"}
        initialIngredients={ingredients || []}
        initialDirections={directions || []}
        initialChefTip={recipe.chef_tip_sr}
      />
    </div>
  );
}
