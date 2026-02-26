"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  initialIngredients: IngredientRow[];
  initialDirections: DirectionRow[];
}

export function EditRecipeForm({
  recipeId,
  slug,
  initialIngredients,
  initialDirections,
}: EditRecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        .update({ updated_at: new Date().toISOString() })
        .eq("id", recipeId);

      router.push(`/recepti/${slug}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Došlo je do greške pri čuvanju.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-6 space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-[var(--ar-gray-200)] bg-white p-5">
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
                className="w-24 rounded-lg border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
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
                className="w-20 rounded-lg border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
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
                className="min-w-[200px] flex-1 rounded-lg border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setIngredients((prev) =>
                    prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
                  )
                }
                className="rounded p-2 text-red-600 hover:bg-red-50"
                aria-label="Ukloni sastojak"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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

      <section className="rounded-xl border border-[var(--ar-gray-200)] bg-white p-5">
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
                className="min-h-[72px] flex-1 rounded-lg border border-[var(--ar-gray-300)] px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setDirections((prev) =>
                    prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
                  )
                }
                className="mt-1 rounded p-2 text-red-600 hover:bg-red-50"
                aria-label="Ukloni korak"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
