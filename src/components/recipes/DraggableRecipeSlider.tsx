"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";

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

export function DraggableRecipeSlider({ recipes, categorySlug }: DraggableRecipeSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (recipes.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1220px] overflow-hidden px-[10px]">
      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView="auto"
        grabCursor
        watchSlidesProgress
        speed={550}
        resistanceRatio={0.9}
        threshold={5}
        longSwipesRatio={0.3}
        navigation={false}
        onSwiper={(swiper: SwiperType) => {
          setTimeout(() => {
            try {
              if (prevRef.current && nextRef.current && swiper?.navigation) {
                const nav = swiper.params?.navigation;
                swiper.params.navigation = {
                  ...(nav && typeof nav === "object" ? nav : {}),
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                };
                swiper.navigation?.init();
                swiper.navigation?.update();
              }
            } catch {
              // Navigation may not be ready yet; ignore
            }
          }, 0);
        }}
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
          ref={prevRef}
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 [&.swiper-button-disabled]:cursor-not-allowed [&.swiper-button-disabled]:opacity-30 [&.swiper-button-disabled]:hover:border-[var(--color-primary)] [&.swiper-button-disabled]:hover:bg-white [&.swiper-button-disabled]:hover:text-[var(--color-primary)]"
          aria-label="Pomeri levo"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          ref={nextRef}
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 [&.swiper-button-disabled]:cursor-not-allowed [&.swiper-button-disabled]:opacity-30 [&.swiper-button-disabled]:hover:border-[var(--color-primary)] [&.swiper-button-disabled]:hover:bg-white [&.swiper-button-disabled]:hover:text-[var(--color-primary)]"
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

