"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface Category {
  id: string;
  slug: string;
  name_sr: string;
  type: string;
}

const SKILL_OPTIONS: { value: string; label: string }[] = [
  { value: "lako", label: "Lako" },
  { value: "srednje", label: "Srednje" },
  { value: "tesko", label: "Teško" },
];

const TIME_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Bilo koje" },
  { value: "do-30", label: "Do 30 min" },
  { value: "do-60", label: "Do 1 h" },
  { value: "do-120", label: "Do 2 h" },
  { value: "120-plus", label: "Preko 2 h" },
];

function buildQueryString(
  params: Record<string, string | undefined>,
  override: Record<string, string | undefined>
): string {
  const merged = { ...params, ...override };
  const entries = Object.entries(merged).filter(
    ([, v]) => v != null && v !== ""
  ) as [string, string][];
  if (entries.length === 0) return "/recepti";
  const q = new URLSearchParams(entries).toString();
  return `/recepti?${q}`;
}

export function FilterSidebar({
  categories,
  activeCategory,
  activeSkill,
  activeTime,
  activeIngredient,
  activeCuisine,
}: {
  categories: Category[];
  activeCategory?: string;
  activeSkill?: string;
  activeTime?: string;
  activeIngredient?: string;
  activeCuisine?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ingredientInput, setIngredientInput] = useState(activeIngredient ?? "");

  const baseParams = {
    kategorija: activeCategory,
    tezina: activeSkill,
    vreme: activeTime,
    sastojak: activeIngredient,
    kuhinja: activeCuisine,
  };

  const mealTypes = categories.filter((c) => c.type === "meal_type");
  const cuisines = categories.filter((c) => c.type === "cuisine");

  const handleIngredientSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = new URLSearchParams(searchParams?.toString() ?? "");
      const val = ingredientInput.trim();
      if (val) q.set("sastojak", val);
      else q.delete("sastojak");
      router.push(`/recepti?${q.toString()}`);
    },
    [ingredientInput, router, searchParams]
  );

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="border border-[var(--ar-gray-200)] bg-white p-5">
        <h3 className="font-dynapuff text-lg font-semibold text-[var(--color-primary)]">
          Filteri
        </h3>

        <div className="mt-5 space-y-6">
          <div>
            <Link
              href="/recepti"
              className="block py-1.5 text-sm font-medium text-[var(--ar-gray-700)] hover:text-[var(--color-accent)]"
            >
              Svi recepti
            </Link>
          </div>

          {/* 1) Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
              Kategorija
            </h4>
            <ul className="mt-2 space-y-0.5">
              {mealTypes.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildQueryString(baseParams, { kategorija: c.slug })}
                    className={`block py-1.5 px-2 text-sm transition-colors ${
                      activeCategory === c.slug
                        ? "font-medium text-[var(--color-accent)] bg-[var(--ar-gray-100)]"
                        : "text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)] hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {c.name_sr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 2) Skill level */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
              Težina
            </h4>
            <ul className="mt-2 space-y-0.5">
              {SKILL_OPTIONS.map((opt) => (
                <li key={opt.value}>
                  <Link
                    href={buildQueryString(baseParams, {
                      tezina: opt.value || undefined,
                    })}
                    className={`block py-1.5 px-2 text-sm transition-colors ${
                      (activeSkill ?? "") === opt.value
                        ? "font-medium text-[var(--color-accent)] bg-[var(--ar-gray-100)]"
                        : "text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)] hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {opt.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3) Time to prepare */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
              Vreme pripreme
            </h4>
            <ul className="mt-2 space-y-0.5">
              {TIME_OPTIONS.map((opt) => (
                <li key={opt.value || "any"}>
                  <Link
                    href={buildQueryString(baseParams, {
                      vreme: opt.value || undefined,
                    })}
                    className={`block py-1.5 px-2 text-sm transition-colors ${
                      (activeTime ?? "") === opt.value
                        ? "font-medium text-[var(--color-accent)] bg-[var(--ar-gray-100)]"
                        : "text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)] hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {opt.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4) Ingredients */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
              Sastojak
            </h4>
            <form onSubmit={handleIngredientSubmit} className="mt-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="npr. piletina"
                className="w-full border border-[var(--ar-gray-200)] bg-white px-3 py-2 text-sm text-[var(--color-primary)] placeholder:text-[var(--ar-gray-500)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <button
                type="submit"
                className="mt-2 w-full border border-[var(--color-primary)] bg-white py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
              >
                Pretraži
              </button>
            </form>
          </div>

          {/* 5) Cuisine */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
              Kuhinja
            </h4>
            <ul className="mt-2 space-y-0.5">
              <li>
                <Link
                  href={buildQueryString(baseParams, { kuhinja: undefined })}
                  className={`block py-1.5 px-2 text-sm transition-colors ${
                    !activeCuisine
                      ? "font-medium text-[var(--color-accent)] bg-[var(--ar-gray-100)]"
                      : "text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)] hover:text-[var(--color-accent)]"
                  }`}
                >
                  Bilo koja
                </Link>
              </li>
              {cuisines.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildQueryString(baseParams, { kuhinja: c.slug })}
                    className={`block py-1.5 px-2 text-sm transition-colors ${
                      activeCuisine === c.slug
                        ? "font-medium text-[var(--color-accent)] bg-[var(--ar-gray-100)]"
                        : "text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)] hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {c.name_sr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
