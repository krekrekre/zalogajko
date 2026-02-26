"use client";

import Link from "next/link";
import { ChefHat, Search } from "lucide-react";
import { POPULAR_SEARCHES } from "@/lib/constants";

export function SearchSection() {
  return (
    <section className="bg-white pt-[7vh] pb-[7vh]">
      <div className="mx-auto flex max-w-[1220px] flex-col items-center justify-start rounded-none border border-[var(--color-primary)] p-4 sm:p-6">
        <div className="flex w-full flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-start">
          {/* Left: What would you like to cook? + search */}
          <div className="min-w-0 flex-1 lg:max-w-xl">
            <h2 className="font-dynapuff flex items-center gap-2 text-lg font-semibold text-[var(--color-primary)] sm:text-2xl">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-[#f1f1e6]">
                <ChefHat
                  className="h-5 w-5 shrink-0 fill-[var(--ar-primary)] text-[var(--ar-primary)]"
                  aria-hidden
                />
              </span>
              Šta biste želeli da skuvate?
            </h2>
            <form action="/recepti" method="GET" className="mt-4">
              <div className="flex overflow-hidden rounded-none border border-[var(--color-primary)]">
                <input
                  type="search"
                  name="sastojak"
                  placeholder="Pretražite ovde..."
                  className="min-h-12 flex-1 border-0 bg-white px-4 py-3 text-sm text-[var(--ar-gray-700)] placeholder-[var(--ar-gray-500)] focus:outline-none focus:ring-0 sm:text-base"
                  aria-label="Pretražite recepte"
                />
                <button
                  type="submit"
                  className="flex w-12 shrink-0 cursor-pointer items-center justify-center bg-[var(--ar-primary)] text-white transition-colors hover:bg-[var(--ar-primary-hover)]"
                  aria-label="Pretraži"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Right: Popular searches grid */}
          <div className="w-full shrink-0 lg:w-[420px]">
            <h3 className="mb-3 text-base font-semibold text-[var(--color-primary)]">
              Popularne pretrage
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-5">
              {POPULAR_SEARCHES.slice(0, 8).map((s) => (
                <Link
                  key={s.slug}
                  href={`/recepti?sastojak=${encodeURIComponent(s.label)}`}
                  className="rounded-none bg-[var(--ar-primary)] px-3 py-2 text-center text-xs font-medium text-[var(--color-primary)] transition-colors hover:opacity-90 sm:text-sm"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
