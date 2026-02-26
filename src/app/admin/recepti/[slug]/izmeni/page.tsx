import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/admin/recepti/${slug}/izmeni`);
  }

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("id, slug, title_sr, author_id")
    .eq("slug", slug)
    .single();

  if (error || !recipe) notFound();
  if (recipe.author_id !== user.id) {
    redirect(`/recepti/${slug}`);
  }

  const [{ data: ingredients }, { data: directions }] = await Promise.all([
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
  ]);

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

      <EditRecipeForm
        recipeId={recipe.id}
        slug={recipe.slug}
        initialIngredients={ingredients || []}
        initialDirections={directions || []}
      />
    </div>
  );
}
