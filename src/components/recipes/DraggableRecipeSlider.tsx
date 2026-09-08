"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

import { RecipeCard } from "@/components/RecipeCard";

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

interface DraggableRecipeSliderProps {
  recipes: Recipe[];
  variant?: "cream" | "white";
  /** Category slug for canonical recipe links */
  categorySlug?: string;
}

const ARROW_CLASS =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)] transition-all disabled:cursor-not-allowed disabled:opacity-30 hover:enabled:border-[var(--color-accent)] hover:enabled:bg-[var(--color-accent)] hover:enabled:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2";

export function DraggableRecipeSlider({ recipes, categorySlug }: DraggableRecipeSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
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

  if (recipes.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1220px] overflow-hidden px-[10px]">
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
        className="recipe-slider !overflow-hidden"
      >
        {recipes.map((recipe) => (
          <SwiperSlide
            key={recipe.id}
            className="recipe-slider__slide !w-[260px] sm:!w-[280px]"
          >
            <RecipeCard
              slug={recipe.slug}
              title={recipe.title_sr}
              imageUrl={recipe.image_url}
              prepTime={recipe.prep_time_minutes}
              cookTime={recipe.cook_time_minutes}
              ratingCount={recipe.rating_count ?? 0}
              ratingAvg={recipe.rating_avg}
              categorySlug={categorySlug}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Arrows */}
      <div className="mt-4 flex justify-center gap-6 py-[5px]">
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={atStart || locked}
          className={ARROW_CLASS}
          aria-label="Pomeri levo"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          disabled={atEnd || locked}
          className={ARROW_CLASS}
          aria-label="Pomeri desno"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

