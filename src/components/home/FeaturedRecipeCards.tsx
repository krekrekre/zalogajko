"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { getSavedRecipeIds, toggleSavedRecipe } from "@/lib/saved-recipes";
import { RotateCcw, ChevronLeft, ChevronRight, Heart } from "lucide-react";

// Category tags – yellow-orange banner style (top-left on image)
const FEATURED_TAGS = [
  "Najčuvaniji recept",
  "Klasik",
  "Lak prilog",
  "Slatkiše",
  "Za svečanu priliku",
  "Brza večera",
];

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
    <span
      className="inline-flex gap-0.5 text-[var(--color-primary)]"
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

interface FeaturedRecipe {
  id: string;
  slug: string;
  title_sr: string;
  image_url: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  author_name: string | null;
  rating_count: number;
  rating_avg: number | null;
  review_quote: string | null;
}

interface FeaturedRecipeCardsProps {
  recipes: FeaturedRecipe[];
}

export function FeaturedRecipeCards({ recipes }: FeaturedRecipeCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getSavedRecipeIds().then(setSavedIds);
  }, []);

  const onToggleSave = (recipeId: string, saved: boolean) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(recipeId);
      else next.delete(recipeId);
      return next;
    });
  };

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recipes.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = 280;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
    setTimeout(updateScrollState, 300);
  };

  return (
    <section className="border-b border-[var(--ar-gray-200)] bg-[#f1f1e6] pt-[7vh] pb-[7vh]">
      <div className="mx-auto max-w-[1284px] px-8">
        {/* Top row: heading (left), arrows (right) */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-dynapuff text-[30px] font-semibold text-[var(--color-primary)]">
              Počnite da čuvate ova jela
            </h2>
            <p className="mt-1 text-sm text-[var(--ar-gray-500)]">
              Čuvajte omiljene recepte u Moji recepti besplatno.
            </p>
          </div>
          {recipes.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-primary)] bg-white text-[var(--color-accent)] shadow-sm transition-all duration-200 disabled:opacity-40 hover:enabled:scale-105 hover:enabled:bg-[var(--ar-primary)] hover:enabled:text-white hover:enabled:border-[var(--ar-primary)]"
                aria-label="Prethodne kartice"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-primary)] bg-white text-[var(--color-accent)] shadow-sm transition-all duration-200 disabled:opacity-40 hover:enabled:scale-105 hover:enabled:bg-[var(--ar-primary)] hover:enabled:text-white hover:enabled:border-[var(--ar-primary)]"
                aria-label="Sledeće kartice"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Horizontal scroll of cards */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="mt-8 flex gap-5 overflow-x-auto no-scrollbar pb-2"
        >
          {recipes.map((recipe, idx) => (
            <FeaturedFlipCard
              key={recipe.id}
              recipe={recipe}
              tag={FEATURED_TAGS[idx % FEATURED_TAGS.length]}
              savedIds={savedIds}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>

        {recipes.length > 0 && (
          <p className="mt-4 flex items-center justify-center gap-2 text-[18px] text-[var(--ar-gray-500)]">
            Klikni da preokrenes
            <RotateCcw className="h-5 w-5 shrink-0" aria-hidden />
          </p>
        )}

        {recipes.length === 0 && (
          <p className="py-12 text-center text-[var(--ar-gray-500)]">
            Nema featured recepta još uvek.
          </p>
        )}
      </div>
    </section>
  );
}

function FeaturedFlipCard({
  recipe,
  tag,
  savedIds,
  onToggleSave,
}: {
  recipe: FeaturedRecipe;
  tag: string;
  savedIds: Set<string>;
  onToggleSave: (recipeId: string, saved: boolean) => void;
}) {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [saving, setSaving] = useState(false);
  const isSaved = savedIds.has(recipe.id);
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const cardWidth = 260;
  const heartColor = isSaved
    ? "var(--ar-primary)"
    : isHovered
      ? "var(--ar-primary)"
      : "var(--color-primary)";

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    const result = await toggleSavedRecipe(recipe.id);
    setSaving(false);
    if (result === null) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    onToggleSave(recipe.id, result);
  };

  return (
    <div
      className="group shrink-0 cursor-pointer perspective-[1000px]"
      style={{ width: cardWidth }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className={`relative h-[380px] transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front – match image: white card, tag top-left, title, stars+count, time, Save button */}
        <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden border border-[var(--ar-gray-200)] bg-white shadow-[var(--ar-card-shadow)] [backface-visibility:hidden]">
          <div className="relative h-[168px] shrink-0 overflow-hidden bg-[var(--ar-gray-100)]">
            <Image
              src={recipe.image_url || PLACEHOLDER_IMAGES.default}
              alt={recipe.title_sr}
              fill
              className="object-cover"
              sizes="260px"
            />
            <span className="absolute left-2 top-2 rounded bg-[#d97706] px-2 py-1 text-xs font-bold uppercase leading-tight text-white">
              {tag}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-3">
            <h3 className="text-[23px] font-semibold leading-tight text-[var(--color-primary)] line-clamp-2">
              {recipe.title_sr}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--ar-gray-500)]">
              {recipe.rating_count > 0 && (
                <>
                  {recipe.rating_avg != null && (
                    <StarRating avg={recipe.rating_avg} />
                  )}
                  <span>({recipe.rating_count})</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {formatTime(totalTime)}
              </span>
            </div>
            <div className="mt-auto pt-2">
              <Link
                href="/moji-recepti"
                className="inline-flex w-full items-center justify-center gap-2 rounded-none border border-[var(--color-primary)] bg-white py-2.5 text-[16px] font-bold text-[var(--color-primary)] transition-all duration-200 hover:scale-105 hover:bg-[var(--ar-gray-100)]"
                onClick={handleSaveClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {saving ? "..." : "Sačuvaj recept"}
                <Heart
                  className="h-4 w-4 shrink-0 transition-colors"
                  fill={isSaved ? heartColor : "none"}
                  stroke={heartColor}
                  strokeWidth={isSaved ? 0 : 2}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Back – quote */}
        <div className="absolute inset-0 flex flex-col justify-between border border-[var(--ar-gray-200)] bg-[var(--ar-primary-light)] p-5 shadow-[var(--ar-card-shadow)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="line-clamp-4 text-[var(--color-primary)] italic">
            &ldquo;
            {recipe.review_quote || "Ovaj recept je preporuka zajednice."}
            &rdquo;
          </p>
          <cite className="block text-sm text-[var(--ar-gray-500)] not-italic">
            — {recipe.author_name || "Domaći kuvar"}
          </cite>
          <Link
            href={`/recepti/${recipe.slug}`}
            className="flex items-center justify-center gap-2 rounded-none bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
            onClick={(e) => e.stopPropagation()}
          >
            <RotateCcw className="h-4 w-4" />
            Vidi recept
          </Link>
        </div>
      </div>
    </div>
  );
}
