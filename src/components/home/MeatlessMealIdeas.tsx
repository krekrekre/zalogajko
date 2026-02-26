import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Heart } from "lucide-react";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

export interface SectionRecipe {
  id: string;
  slug: string;
  title_sr: string;
  image_url: string | null;
  rating_count: number;
  rating_avg: number | null;
  categories?: Array<{ slug: string; name_sr: string }>;
}

interface MeatlessMealIdeasProps {
  recipes: SectionRecipe[];
}

function StarRating({ avg }: { avg: number }) {
  const full = Math.min(5, Math.floor(avg));
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[var(--ar-primary)]"
      aria-hidden
    >
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < full ? "fill-current" : "fill-[var(--ar-gray-200)]"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function SectionCard({ recipe }: { recipe: SectionRecipe }) {
  const categoryName =
    recipe.categories?.[0]?.name_sr?.toUpperCase() ?? "RECEPTI";
  const imageUrl = recipe.image_url || PLACEHOLDER_IMAGES.default;

  return (
    <Link
      href={`/recepti/${recipe.slug}`}
      className="group block overflow-hidden bg-white transition-all duration-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--ar-gray-100)]">
        <Image
          src={imageUrl}
          alt={recipe.title_sr}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute right-3 top-3">
          <Heart
            className="h-5 w-5 text-white drop-shadow-md"
            strokeWidth={2}
          />
        </div>
      </div>
      <div className="p-3 pl-0 sm:p-4 sm:pl-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ar-gray-500)]">
          {categoryName}
        </span>
        <h3 className="mt-1 line-clamp-2 text-xl font-semibold leading-tight text-[var(--color-primary)] transition-colors group-hover:text-[var(--ar-primary)] group-hover:underline group-hover:decoration-[var(--color-orange)] sm:text-[23px]">
          {recipe.title_sr}
        </h3>
        {recipe.rating_count > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            {recipe.rating_avg != null && (
              <StarRating avg={recipe.rating_avg} />
            )}
            <span className="text-[var(--ar-gray-500)]">
              {recipe.rating_count}{" "}
              {recipe.rating_count === 1 ? "ocena" : "ocena"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function MeatlessMealIdeas({ recipes }: MeatlessMealIdeasProps) {
  return (
    <section className="bg-white pt-[7vh] pb-[7vh] shadow-none border-b-0">
      <div className="mx-auto max-w-[1284px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <Link
            href="/recepti"
            className="inline-flex items-center gap-1 text-center text-[30px] font-bold text-[var(--color-primary)] transition-colors hover:text-[var(--ar-primary)] hover:underline hover:decoration-[var(--ar-primary)] hover:decoration-2 hover:underline-offset-2"
          >
            Ideje za obroke bez mesa
            <ChevronRight className="h-7 w-7" aria-hidden />
          </Link>
        </div>
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-16">
          {recipes.slice(0, 6).map((recipe) => (
            <SectionCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
        {recipes.length === 0 && (
          <p className="py-12 text-center text-[var(--ar-gray-500)]">
            Nema recepta u ovoj kategoriji.
          </p>
        )}
      </div>
    </section>
  );
}
