"use client";

import { useState, useEffect } from "react";
import { Star, Share2 } from "lucide-react";
import { isRecipeSaved } from "@/lib/saved-recipes";
import { SaveRecipeDropdown } from "@/components/SaveRecipeDropdown";

interface RecipeActionsProps {
  recipeId: string;
  slug: string;
  title: string;
  /** Canonical path for login redirect (e.g. /recepti/hladna-predjela/podvarak-10) */
  canonicalPath?: string;
}

export function RecipeActions({
  recipeId,
  slug,
  title,
  canonicalPath,
}: RecipeActionsProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    isRecipeSaved(recipeId).then(setIsSaved);
  }, [recipeId]);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
          text: `Pogledaj ovaj recept: ${title}`,
        });
      } catch {
        await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  function scrollToReviews() {
    document.getElementById("rate")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="no-print mt-4">
      <div className="inline-flex flex-wrap border border-[var(--ar-gray-250)]">
        <SaveRecipeDropdown
          recipeId={recipeId}
          isSaved={isSaved}
          onSaved={() => setIsSaved(true)}
          onUnsaved={() => setIsSaved(false)}
          loginNextPath={canonicalPath ?? `/recepti/${slug}`}
          variant="button"
        />
        <button
          type="button"
          onClick={scrollToReviews}
          className="flex w-1/2 cursor-pointer items-center justify-center gap-1.5 border-b border-[var(--ar-gray-200)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--ar-gray-700)] hover:underline sm:w-auto sm:border-b-0 sm:border-r sm:border-[var(--ar-gray-400)] sm:py-2.5"
        >
          <Star className="size-4" strokeWidth={2} />
          Oceni
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex w-1/2 cursor-pointer items-center justify-center gap-1.5 border-r border-[var(--ar-gray-200)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--ar-gray-700)] hover:underline sm:w-auto sm:py-2.5"
        >
          <Share2 className="size-4" />
          Podeli
        </button>
      </div>
    </div>
  );
}
