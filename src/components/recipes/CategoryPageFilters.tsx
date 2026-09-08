"use client";

import Link from "next/link";

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

function buildCategoryUrl(
  categorySlug: string,
  tezina?: string,
  vreme?: string,
  basePath = "/recepti"
): string {
  const params = new URLSearchParams();
  if (tezina) params.set("tezina", tezina);
  if (vreme) params.set("vreme", vreme);
  const q = params.toString();
  return q ? `${basePath}/${categorySlug}?${q}` : `${basePath}/${categorySlug}`;
}

export function CategoryPageFilters({
  categorySlug,
  basePath = "/recepti",
  activeTezina,
  activeVreme,
}: {
  categorySlug: string;
  /** Base path for filter links, e.g. "/recepti" or "/kuhinja" */
  basePath?: string;
  activeTezina?: string;
  activeVreme?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-[var(--ar-gray-200)] bg-white py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
          Težina:
        </span>
        {SKILL_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={buildCategoryUrl(categorySlug, opt.value, activeVreme, basePath)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTezina === opt.value
                ? "bg-[var(--color-accent)] text-[var(--color-primary)]"
                : "bg-[var(--ar-gray-200)] text-[var(--ar-gray-700)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--ar-primary-ink)]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
          Vreme:
        </span>
        {TIME_OPTIONS.map((opt) => (
          <Link
            key={opt.value || "any"}
            href={buildCategoryUrl(categorySlug, activeTezina, opt.value || undefined, basePath)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              (activeVreme ?? "") === opt.value
                ? "bg-[var(--color-accent)] text-[var(--color-primary)]"
                : "bg-[var(--ar-gray-200)] text-[var(--ar-gray-700)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--ar-primary-ink)]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>
      {(activeTezina || activeVreme) && (
        <Link
          href={`${basePath}/${categorySlug}`}
          className="ml-auto rounded-full border border-[var(--ar-gray-300)] bg-white px-3.5 py-1.5 text-sm font-medium text-[var(--ar-gray-600)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--ar-primary-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
        >
          Očisti filtere
        </Link>
      )}
    </div>
  );
}
