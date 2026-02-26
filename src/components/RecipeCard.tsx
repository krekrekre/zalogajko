import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

interface RecipeCardProps {
  slug: string;
  title: string;
  imageUrl?: string | null;
  prepTime: number;
  cookTime: number;
  ratingCount?: number;
  ratingAvg?: number | null;
  tag?: string;
}

function formatTime(minutes: number) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  }
  return `${minutes} min`;
}

function StarRating({ avg }: { avg: number }) {
  const full = Math.min(5, Math.floor(avg));
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--ar-primary)]" aria-label={`${avg.toFixed(1)} od 5 zvezdica`}>
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

export function RecipeCard({
  slug,
  title,
  imageUrl,
  prepTime,
  cookTime,
  ratingCount = 0,
  ratingAvg,
  tag,
}: RecipeCardProps) {
  const totalTime = prepTime + cookTime;

  return (
    <Link
      href={`/recepti/${slug}`}
      className="group block overflow-hidden rounded-none border border-[var(--color-primary)] bg-[#f1f1e6] transition-all duration-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--ar-gray-100)]">
        <Image
          src={imageUrl || PLACEHOLDER_IMAGES.default}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {tag && (
          <span className="absolute right-2 top-2 rounded-full bg-[var(--ar-primary)] px-2 py-1 text-[11px] font-semibold text-white sm:right-3 sm:top-3 sm:px-2.5 sm:text-xs">
            {tag}
          </span>
        )}
      </div>
      <div className="bg-[#f1f1e6] p-3 sm:p-4">
        <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-[var(--ar-gray-700)] transition-colors group-hover:text-[var(--ar-primary)] sm:text-[23px]">
          {title}
        </h3>
        {ratingCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            {ratingAvg != null && <StarRating avg={ratingAvg} />}
            <span className="text-[var(--ar-gray-500)]">
              {ratingCount} {ratingCount === 1 ? "ocena" : "ocena"}
            </span>
          </div>
        )}
        <p className="mt-1 text-sm text-[var(--ar-gray-500)]">
          {formatTime(totalTime)}
        </p>
        <span className="mt-3 inline-block text-sm font-medium text-[var(--ar-primary)] group-hover:underline">
          Vidi recept →
        </span>
      </div>
    </Link>
  );
}
