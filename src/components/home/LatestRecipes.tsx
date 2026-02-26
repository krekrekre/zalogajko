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
    <section className="border-b border-[var(--ar-gray-200)] bg-[#f1f1e6] pt-[7vh] pb-[7vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="mb-4 border-b-4 border-[var(--ar-primary)]">
            <h2 className="font-dynapuff text-2xl font-medium leading-tight tracking-tight text-[var(--color-primary)] sm:text-[36px] mb-0">
              Najnovije
            </h2>
          </div>
          <Link
            href="/recepti?sort=latest"
            className="text-sm font-semibold text-[var(--ar-primary)] hover:text-[var(--ar-primary-hover)] hover:underline"
          >
            Vidi više →
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
