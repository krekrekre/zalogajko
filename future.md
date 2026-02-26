# Future Tasks

- Re-add `Štampaj` button in `RecipeActions` when print flow is fully designed and tested.
# Future / TODO

## Recipe page – bring back rating and reviews

**Status:** Hidden for now. Restore when ready.

**What was hidden:**

1. **Recipe page (`src/app/recepti/[slug]/page.tsx`)**
   - **Rating in header:** Star display (★) and rating text (e.g. "4.5 (12)") below the title.
   - **Review link in header:** "X recenzija" link to `#reviews`.
   - **RateRecipe component:** Block where users can rate the recipe (stars).
   - **ReviewsSection component:** Block that lists reviews and the review form.

**How to restore:**

1. In `src/app/recepti/[slug]/page.tsx`:
   - Re-add imports: `RateRecipe` from `@/components/RateRecipe`, `ReviewsSection` from `@/components/ReviewsSection`.
   - In the meta line under the title, restore the star display, rating count, separator, and "X recenzija" link before "Ažurirano" (see git history or this file for structure).
   - Above the "Takođe će vam se svideti" section, render `<RateRecipe ... />` and `<section id="reviews"><ReviewsSection recipeId={recipe.id} /></section>` again.

2. Remove the `{/* TODO: restore rating and reviews – see future.md */}` and `{/* TODO: restore rating stars and review count – see future.md */}` comments once restored.

**Components (unchanged, only usage was removed):**

- `@/components/RateRecipe`
- `@/components/ReviewsSection`

Data (`recipe.rating_avg`, `recipe.rating_count`, `recipe.review_count`) is still loaded by `getRecipeBySlug`; no API or schema changes needed to turn this back on.
