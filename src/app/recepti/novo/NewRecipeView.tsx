"use client";

import { useState } from "react";
import { AddRecipeForm } from "@/components/AddRecipeForm";

type Category = { id: string; slug: string; name_sr: string; type: string };

/**
 * Wraps the heading and the form so the heading can go away.
 *
 * Once the recipe is in the moderation queue there is no form left to
 * introduce, and "Dodajte novi recept" sitting over a confirmation reads like
 * the submission did not take. The form keeps its own copy of that state for
 * the confirmation card; this only needs to know when to stop drawing the
 * header.
 *
 * AddRecipeForm stays at the same position in the tree either way -- moving it
 * would remount it and throw away the very state that put us here.
 */
export function NewRecipeView({ categories }: { categories: Category[] }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      {!submitted && (
        /* Cream band, the same one the home page uses behind "Najnovije".
           The header's desktop nav carries mb-8 for every other page, so pull
           that back here to sit the band flush under it. The nav is hidden
           below md, where there is no gap to close. */
        <div className="border-b border-[var(--ar-gray-200)] bg-[var(--ar-cream)] md:-mt-8">
          <div className="mx-auto max-w-[1060px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <div className="max-w-[760px]">
              <h1 className="break-words text-3xl font-bold leading-tight text-[var(--ar-gray-900)] sm:text-4xl lg:text-[46px]">
                Dodajte novi recept
              </h1>
              <p className="mt-4 max-w-[60ch] leading-relaxed text-[var(--ar-gray-700)]">
                Popunite podatke i objavite recept. Svaki deo forme stoji tačno
                tamo gde će stajati i na objavljenoj strani recepta.
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`mx-auto max-w-[1060px] px-4 sm:px-6 lg:px-8 ${
          submitted ? "pt-10 sm:pt-14" : ""
        }`}
      >
        <div className="max-w-[760px]">
          <AddRecipeForm
            categories={categories}
            onSubmittedForReview={() => setSubmitted(true)}
          />
        </div>
      </div>
    </>
  );
}
