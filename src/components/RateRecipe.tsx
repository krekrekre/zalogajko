"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RateRecipeProps {
  recipeId: string;
  authorId: string | null;
  initialAvg?: number | null;
  initialCount?: number;
  userRating?: number | null;
}

export function RateRecipe({
  recipeId,
  authorId,
  initialAvg = null,
  initialCount = 0,
  userRating = null,
}: RateRecipeProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [rating, setRating] = useState<number | null>(userRating ?? null);
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isOwnRecipe = !!user && !!authorId && user.id === authorId;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: rating } = await supabase
          .from("ratings")
          .select("stars")
          .eq("user_id", data.user.id)
          .eq("recipe_id", recipeId)
          .maybeSingle();
        if (rating) setRating((rating as { stars: number }).stars);
      }
    });
  }, [recipeId]);

  async function submitRating(stars: number) {
    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}#rate`;
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("ratings").upsert(
      { user_id: user.id, recipe_id: recipeId, stars },
      { onConflict: "user_id,recipe_id" }
    );
    setRating(stars);
    setSubmitting(false);
    router.refresh();
  }

  const display = hover ?? rating ?? 0;
  const avg = initialAvg;
  const count = initialCount;

  if (isOwnRecipe) {
    return (
      <div id="rate" className="no-print mt-8 rounded-xl border border-[var(--ar-gray-200)] bg-[#ffffff] p-6">
        <h3 className="font-semibold text-[var(--ar-gray-700)]">Ocenite recept</h3>
        <p className="mt-2 text-sm text-[var(--ar-gray-500)]">
          Ne možete oceniti sopstveni recept.
        </p>
        {avg != null && count > 0 && (
          <p className="mt-1 text-sm text-[var(--ar-gray-500)]">
            Prosečna ocena: {avg.toFixed(1)} ({count} ocena)
          </p>
        )}
      </div>
    );
  }

  return (
    <div id="rate" className="no-print mt-8 rounded-xl border border-[var(--ar-gray-200)] bg-[#ffffff] p-6">
      <h3 className="font-semibold text-[var(--ar-gray-700)]">Ocenite recept</h3>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting}
            onClick={() => submitRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className={`text-2xl transition-transform hover:scale-110 disabled:opacity-50 ${
              star <= display ? "text-[var(--ar-primary)]" : "text-[var(--ar-gray-200)]"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {avg != null && count > 0 && (
        <p className="mt-1 text-sm text-[var(--ar-gray-500)]">
          Prosečna ocena: {avg.toFixed(1)} ({count} ocena)
        </p>
      )}
    </div>
  );
}
