import Link from "next/link";
import { RecipeCard } from "@/components/RecipeCard";

interface Recipe {
  id: string;
  slug: string;
  title_sr: string;
  image_url: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
}

interface LatestRecipesProps {
  recipes: Recipe[];
}

export function LatestRecipes({ recipes }: LatestRecipesProps) {
  return (
    <section className="border-b border-[var(--ar-gray-200)] bg-[var(--ar-cream)] pt-[7vh] pb-[7vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="mb-4 border-b-4 border-[var(--ar-primary)]">
            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[var(--color-primary)] sm:text-[36px] mb-0">
              Najnovije
            </h2>
          </div>
          <Link
            href="/recepti"
            className="inline-block border-2 border-[var(--color-primary)] bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)] transition-all duration-200 hover:scale-105 hover:bg-[var(--ar-primary)] hover:text-[var(--color-primary)] hover:border-[var(--ar-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ar-primary)] focus-visible:ring-offset-2"
          >
            Vidi više
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-12">
          {recipes.slice(0, 6).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              slug={recipe.slug}
              title={recipe.title_sr}
              imageUrl={recipe.image_url}
              prepTime={recipe.prep_time_minutes}
              cookTime={recipe.cook_time_minutes}
            />
          ))}
        </div>
        {recipes.length === 0 && (
          <p className="py-12 text-center text-[var(--ar-gray-500)]">
            Nema recepta još uvek. Dodajte prvi recept!
          </p>
        )}
      </div>
    </section>
  );
}
