"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidateRecipeCaches } from "@/app/recepti/actions";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

type IngredientRow = {
  amount: string;
  unit_sr: string;
  name_sr: string;
};

type DirectionRow = {
  instruction_sr: string;
  image_url: string | null;
};

interface EditRecipeFormProps {
  recipeId: string;
  slug: string;
  /**
   * A live recipe cannot be written directly: the edit becomes a revision an
   * admin has to apply. Anything else the author still edits in place.
   */
  isPublished: boolean;
  initialIngredients: IngredientRow[];
  initialDirections: DirectionRow[];
  initialChefTip?: string | null;
}

export function EditRecipeForm({
  recipeId,
  slug,
  isPublished,
  initialIngredients,
  initialDirections,
  initialChefTip,
}: EditRecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisionSent, setRevisionSent] = useState(false);

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialIngredients.length > 0
      ? initialIngredients
      : [{ amount: "", unit_sr: "", name_sr: "" }],
  );
  const [directions, setDirections] = useState<DirectionRow[]>(
    initialDirections.length > 0
      ? initialDirections
      : [{ instruction_sr: "", image_url: null }],
  );
  const [chefTip, setChefTip] = useState(initialChefTip ?? "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validIngredients = ingredients
      .filter((i) => i.name_sr.trim())
      .map((i) => ({
        amount: i.amount.trim() || null,
        unit_sr: i.unit_sr.trim() || null,
        name_sr: i.name_sr.trim(),
      }));

    const validDirections = directions
      .filter((d) => d.instruction_sr.trim())
      .map((d, index) => ({
        step_number: index + 1,
        instruction_sr: d.instruction_sr.trim(),
        sort_order: index,
        image_url: d.image_url,
      }));

    if (validIngredients.length === 0) {
      setError("Dodajte bar jedan sastojak.");
      setLoading(false);
      return;
    }

    if (validDirections.length === 0) {
      setError("Dodajte bar jedan korak pripreme.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      if (isPublished) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Niste prijavljeni.");

        const { error: revisionError } = await supabase
          .from("recipe_revisions")
          .insert({
            recipe_id: recipeId,
            author_id: user.id,
            payload: {
              ingredients: validIngredients.map((i, sort_order) => ({
                ...i,
                sort_order,
              })),
              directions: validDirections,
              chef_tip_sr: chefTip.trim() || null,
            },
          });
        if (revisionError) throw revisionError;

        // Nothing public changed, so no cache to bust.
        setRevisionSent(true);
        setLoading(false);
        return;
      }

      const { error: deleteIngredientsError } = await supabase
        .from("ingredients")
        .delete()
        .eq("recipe_id", recipeId);
      if (deleteIngredientsError) throw deleteIngredientsError;

      const { error: insertIngredientsError } = await supabase
        .from("ingredients")
        .insert(
          validIngredients.map((i, index) => ({
            recipe_id: recipeId,
            amount: i.amount,
            unit_sr: i.unit_sr,
            name_sr: i.name_sr,
            sort_order: index,
          })),
        );
      if (insertIngredientsError) throw insertIngredientsError;

      const { error: deleteDirectionsError } = await supabase
        .from("directions")
        .delete()
        .eq("recipe_id", recipeId);
      if (deleteDirectionsError) throw deleteDirectionsError;

      const { error: insertDirectionsError } = await supabase
        .from("directions")
        .insert(
          validDirections.map((d) => ({
            recipe_id: recipeId,
            step_number: d.step_number,
            instruction_sr: d.instruction_sr,
            sort_order: d.sort_order,
            image_url: d.image_url,
          })),
        );
      if (insertDirectionsError) throw insertDirectionsError;

      await supabase
        .from("recipes")
        .update({
          chef_tip_sr: chefTip.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", recipeId);

      await revalidateRecipeCaches();
      router.push(`/recepti/${slug}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Došlo je do greške pri čuvanju.",
      );
      setLoading(false);
    }
  }

  if (revisionSent) {
    return (
      <div className="mt-6 border-2 border-[var(--color-orange)] bg-[var(--ar-cream)] p-6">
        <h2 className="text-xl font-bold text-[var(--color-primary)]">
          Izmene su poslate na odobrenje
        </h2>
        <p className="mt-2 text-[15px] text-[var(--color-primary)]">
          Recept ostaje objavljen u postojećem obliku dok administrator ne
          pregleda izmene.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/recepti/${slug}`}
            className="rounded-none bg-[var(--color-orange)] px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Nazad na recept
          </Link>
          <Link
            href="/moji-recepti/autorski"
            className="rounded-none border-2 border-[var(--color-orange)] px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]"
          >
            Moji recepti
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="mt-6 space-y-8">
      {isPublished && (
        <div className="rounded-none border border-[var(--ar-gray-300)] bg-[var(--ar-cream)] p-3 text-sm text-[var(--color-primary)]">
          Ovaj recept je objavljen, pa izmene idu administratoru na odobrenje.
          Objavljena verzija ostaje na sajtu do tada.
        </div>
      )}
      {error && (
        <div className="rounded-none border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-none border border-[var(--ar-gray-200)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--ar-gray-700)]">Sastojci</h2>
        <p className="mt-1 text-sm text-[var(--ar-gray-500)]">
          Ispravite listu sastojaka i sačuvajte.
        </p>
        <div className="mt-4 space-y-2">
          {ingredients.map((row, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Količina"
                value={row.amount}
                onChange={(e) =>
                  setIngredients((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, amount: e.target.value } : x,
                    ),
                  )
                }
                className="w-24 rounded-none border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Jed."
                value={row.unit_sr}
                onChange={(e) =>
                  setIngredients((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, unit_sr: e.target.value } : x,
                    ),
                  )
                }
                className="w-20 rounded-none border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Naziv sastojka"
                value={row.name_sr}
                onChange={(e) =>
                  setIngredients((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, name_sr: e.target.value } : x,
                    ),
                  )
                }
                className="min-w-[200px] flex-1 rounded-none border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setIngredients((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  className="rounded-none p-2 text-red-600 hover:bg-red-50"
                  aria-label="Ukloni sastojak"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setIngredients((prev) => [
                ...prev,
                { amount: "", unit_sr: "", name_sr: "" },
              ])
            }
            className="border-[var(--color-orange)] text-[var(--color-orange)]"
          >
            <Plus className="mr-1 h-4 w-4" />
            Dodaj sastojak
          </Button>
        </div>
      </section>

      <section className="rounded-none border border-[var(--ar-gray-200)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--ar-gray-700)]">Koraci pripreme</h2>
        <div className="mt-4 space-y-3">
          {directions.map((row, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 w-6 text-sm font-semibold text-[var(--color-orange)]">
                {i + 1}.
              </span>
              <textarea
                rows={3}
                placeholder="Opis koraka"
                value={row.instruction_sr}
                onChange={(e) =>
                  setDirections((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, instruction_sr: e.target.value } : x,
                    ),
                  )
                }
                className="min-h-[72px] flex-1 break-words rounded-none border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
              />
              {directions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setDirections((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  className="mt-1 rounded-none p-2 text-red-600 hover:bg-red-50"
                  aria-label="Ukloni korak"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setDirections((prev) => [
                ...prev,
                { instruction_sr: "", image_url: null },
              ])
            }
            className="border-[var(--color-orange)] text-[var(--color-orange)]"
          >
            <Plus className="mr-1 h-4 w-4" />
            Dodaj korak
          </Button>
        </div>
      </section>

      <section className="rounded-none border border-[var(--ar-gray-200)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--ar-gray-700)]">
          Savet kuvara
        </h2>
        <p className="mt-1 text-sm text-[var(--ar-gray-500)]">
          Opciono. Jedan trik iz iskustva koji čini razliku. Ostavite prazno da
          uklonite savet.
        </p>
        <textarea
          rows={3}
          value={chefTip}
          onChange={(e) => setChefTip(e.target.value)}
          placeholder="npr. Testo ostavite da odstoji 30 minuta — palačinke će biti znatno mekše."
          aria-label="Savet kuvara"
          className="mt-4 min-h-[84px] w-full break-words rounded-none border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
        />
      </section>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-orange)] text-white hover:bg-[var(--ar-primary-hover)]"
        >
          {loading ? "Čuvanje..." : "Sačuvaj izmene"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/recepti/${slug}`)}>
          Otkaži
        </Button>
      </div>
    </form>
  );
}
