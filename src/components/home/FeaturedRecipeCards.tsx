"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { getRecipeCanonicalPath } from "@/lib/recipe-path";
import Image from "next/image";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { getSavedRecipeIds } from "@/lib/saved-recipes";
import { SaveRecipeDropdown } from "@/components/SaveRecipeDropdown";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";

// Category tags – yellow-orange banner style (top-left on image)
const FEATURED_TAGS = [
  "Najčuvaniji recept",
  "Klasik",
  "Lak prilog",
  "Slatkiše",
  "Za svečanu priliku",
  "Brza večera",
];

const ARROW_CLASS =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-primary)] bg-white text-[var(--ar-primary-ink)] shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:scale-105 hover:enabled:border-[var(--ar-primary)] hover:enabled:bg-[var(--ar-primary)] hover:enabled:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";

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
  author_id: string | null;
  author_name: string | null;
  author_display_name?: string;
  rating_count: number;
  rating_avg: number | null;
  review_quote: string | null;
  categories?: Array<{ slug: string; name_sr: string; type?: string | null; sort_order?: number | null }>;
}

interface FeaturedRecipeCardsProps {
  recipes: FeaturedRecipe[];
}

export function FeaturedRecipeCards({ recipes }: FeaturedRecipeCardsProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  // Swiper owns the scroll position, so the arrows' enabled state has to be
  // mirrored back into React rather than read on render.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [locked, setLocked] = useState(false);

  const syncNav = (swiper: SwiperType) => {
    setAtStart(swiper.isBeginning);
    setAtEnd(swiper.isEnd);
    setLocked(swiper.isLocked);
  };

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

  return (
    <section className="border-b border-[var(--ar-gray-200)] bg-[#f1f1e6] pt-[7vh] pb-[7vh]">
      <div className="mx-auto max-w-[1284px] px-8">
        {/* Top row: heading (left), arrows (right) */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-[30px] font-semibold text-[var(--color-primary)]">
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
                onClick={() => swiperRef.current?.slidePrev()}
                disabled={atStart || locked}
                className={ARROW_CLASS}
                aria-label="Prethodne kartice"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                disabled={atEnd || locked}
                className={ARROW_CLASS}
                aria-label="Sledeće kartice"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Slider – drag to scroll, same feel as the recipe rails */}
        {recipes.length > 0 && (
          <Swiper
            spaceBetween={24}
            slidesPerView="auto"
            grabCursor
            watchSlidesProgress
            speed={550}
            resistanceRatio={0.9}
            threshold={5}
            longSwipesRatio={0.3}
            onSwiper={(swiper: SwiperType) => {
              swiperRef.current = swiper;
              syncNav(swiper);
            }}
            onProgress={syncNav}
            onResize={syncNav}
            onUpdate={syncNav}
            className="recipe-slider mt-8 !overflow-hidden"
          >
            {recipes.map((recipe, idx) => (
              <SwiperSlide
                key={recipe.id}
                className="recipe-slider__slide !w-[260px] sm:!w-[280px]"
              >
                <FeaturedRecipeCard
                  recipe={recipe}
                  tag={FEATURED_TAGS[idx % FEATURED_TAGS.length]}
                  savedIds={savedIds}
                  onToggleSave={onToggleSave}
                />
              </SwiperSlide>
            ))}
          </Swiper>
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

function FeaturedRecipeCard({
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
  const isSaved = savedIds.has(recipe.id);
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const href = getRecipeCanonicalPath(recipe);
  const authorName =
    recipe.author_display_name || recipe.author_name || "Domaći kuvar";

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-[var(--ar-gray-200)] bg-white shadow-[var(--ar-card-shadow)] transition-shadow duration-200 hover:shadow-[var(--ar-card-shadow-hover)]">
      {/* The title below carries the same link for keyboard and screen readers. */}
      <Link
        href={href}
        draggable={false}
        className="relative block h-[168px] shrink-0 overflow-hidden bg-[var(--ar-gray-100)]"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={recipe.image_url || PLACEHOLDER_IMAGES.default}
          alt=""
          fill
          draggable={false}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="280px"
        />
        <span className="absolute left-2 top-2 bg-[var(--ar-tag-amber)] px-2 py-1 text-xs font-bold uppercase leading-tight text-white">
          {tag}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-[23px] font-semibold leading-tight text-[var(--color-primary)]">
          <Link
            href={href}
            draggable={false}
            className="line-clamp-2 hover:underline hover:decoration-[var(--color-accent)]"
          >
            {recipe.title_sr}
          </Link>
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--ar-gray-500)]">
          {recipe.rating_count > 0 && (
            <>
              {recipe.rating_avg != null && <StarRating avg={recipe.rating_avg} />}
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

        {recipe.review_quote && (
          <p className="mt-2 line-clamp-2 text-sm italic leading-snug text-[var(--ar-gray-600)]">
            &ldquo;{recipe.review_quote}&rdquo;
          </p>
        )}

        <p className="mt-1.5 text-xs text-[var(--ar-gray-500)]">
          {recipe.author_id ? (
            <Link
              href={`/profil/${recipe.author_id}`}
              draggable={false}
              className="hover:underline hover:decoration-[var(--color-accent)]"
            >
              {authorName}
            </Link>
          ) : (
            authorName
          )}
        </p>

        <div className="mt-auto pt-3">
          <SaveRecipeDropdown
            recipeId={recipe.id}
            isSaved={isSaved}
            onSaved={() => onToggleSave(recipe.id, true)}
            onUnsaved={() => onToggleSave(recipe.id, false)}
            variant="button"
            fullWidth
            saveLabel="Sačuvaj recept"
            savedLabel="Sačuvano"
            recipeTitle={recipe.title_sr}
            recipeImageUrl={recipe.image_url}
            className="group/save inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-[var(--color-primary)] bg-white py-2.5 text-[16px] font-bold text-[var(--color-primary)] transition-colors duration-200 hover:bg-[#faf9f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            heartClassName={`size-[18px] shrink-0 transition-[fill,stroke,transform] duration-200 ${
              isSaved
                ? "fill-[var(--ar-heart-red)] stroke-[var(--ar-heart-red)]"
                : "fill-transparent group-hover/save:scale-110 group-hover/save:fill-[var(--ar-heart-red)] group-hover/save:stroke-[var(--ar-heart-red)] group-focus-visible/save:fill-[var(--ar-heart-red)] group-focus-visible/save:stroke-[var(--ar-heart-red)]"
            }`}
          />
        </div>
      </div>
    </article>
  );
}
