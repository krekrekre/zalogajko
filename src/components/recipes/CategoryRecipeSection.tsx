import Link from "next/link";
import { DraggableRecipeSlider } from "@/components/recipes/DraggableRecipeSlider";

interface Recipe {
  id: string;
  slug: string;
  title_sr: string;
  image_url: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  rating_count?: number;
  rating_avg?: number | null;
}

interface CategoryRecipeSectionProps {
  title: string;
  slug: string;
  recipes: Recipe[];
  variant?: "cream" | "white";
  /** Base path for section links, e.g. "/recepti" or "/kuhinja". Default "/recepti". */
  basePath?: string;
}

export function CategoryRecipeSection({
  title,
  slug,
  recipes,
  variant = "cream",
  basePath = "/recepti",
}: CategoryRecipeSectionProps) {
  if (recipes.length === 0) return null;

  const sectionHref = `${basePath}/${slug}`;

  return (
    <section
      id={slug}
      className={`scroll-mt-24 py-10 ${variant === "white" ? "bg-white" : "bg-[var(--ar-cream)]"}`}
    >
      <div className="mx-auto max-w-[1220px] px-2.5">
        <header className="mb-6 flex items-end justify-between gap-4 pr-2">
          <Link
            href={sectionHref}
            className="border-b-2 border-[var(--color-accent)] pb-1 font-display text-xl font-bold text-[var(--color-primary)] transition-colors hover:text-[var(--ar-primary-ink)] sm:text-2xl"
          >
            <h2 className="inline">{title}</h2>
          </Link>
          <Link
            href={sectionHref}
            className="shrink-0 border-2 border-[var(--color-primary)] bg-white px-3.5 py-1.75 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)]"
          >
            Vidi sve
          </Link>
        </header>

        <div className="-mx-8">
          <DraggableRecipeSlider recipes={recipes} variant={variant} categorySlug={slug} />
        </div>
      </div>
    </section>
  );
}
