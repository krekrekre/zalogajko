import Link from "next/link";
import { Trash2 } from "lucide-react";
import { getDistinctIngredients } from "@/lib/queries/recipes";
import { SastojciSearchForm } from "@/components/sastojci/SastojciSearchForm";
import { getListingMetadata } from "@/lib/seo";

export const metadata = getListingMetadata({
  title: "Sastojci A–Ž",
  description:
    "Pregledajte sastojke po abecedi. Pronađite recepte po sastojku.",
  path: "/sastojci",
});

const SERBIAN_LETTERS = [
  "A",
  "B",
  "C",
  "Č",
  "Ć",
  "D",
  "Đ",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "R",
  "S",
  "Š",
  "T",
  "U",
  "V",
  "Z",
  "Ž",
];

function getFirstLetter(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const first = trimmed[0].toUpperCase();
  const normalized = first.normalize("NFD").replace(/\u0307/g, ""); // Ć has combining dot
  if (
    normalized === "C" &&
    (trimmed.toUpperCase().startsWith("Č") ||
      trimmed.toUpperCase().startsWith("Ć"))
  )
    return trimmed[0].toUpperCase();
  if (normalized === "D" && trimmed.toUpperCase().startsWith("Đ")) return "Đ";
  if (normalized === "S" && trimmed.toUpperCase().startsWith("Š")) return "Š";
  if (normalized === "Z" && trimmed.toUpperCase().startsWith("Ž")) return "Ž";
  return first;
}

function groupByFirstLetter(ingredients: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const name of ingredients) {
    const letter = getFirstLetter(name);
    if (!letter) continue;
    const list = map.get(letter) ?? [];
    list.push(name);
    map.set(letter, list);
  }
  for (const list of map.values())
    list.sort((a, b) => a.localeCompare(b, "sr"));
  return map;
}

export default async function SastojciPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; letter?: string }>;
}) {
  const raw = await searchParams;
  const qRaw = (raw?.q ?? "").trim();
  const q = qRaw.toLowerCase();
  const letterFilter = raw?.letter?.toUpperCase();

  let ingredients = await getDistinctIngredients(2000);

  if (q) {
    ingredients = ingredients.filter((name) => name.toLowerCase().includes(q));
  }
  if (letterFilter) {
    ingredients = ingredients.filter((l) => getFirstLetter(l) === letterFilter);
  }

  const grouped = groupByFirstLetter(ingredients);
  const lettersWithData = new Set(grouped.keys());

  const sortedLetters = SERBIAN_LETTERS.filter((l) => lettersWithData.has(l));
  if (grouped.size > 0 && sortedLetters.length === 0) {
    const allLetters = [...grouped.keys()].sort((a, b) =>
      a.localeCompare(b, "sr"),
    );
    sortedLetters.push(...allLetters);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-dynapuff text-3xl font-bold text-[var(--ar-gray-900)] sm:text-4xl">
          Sastojci A–Ž
        </h1>
        <div className="mt-4">
          <SastojciSearchForm defaultValue={qRaw || undefined} />
        </div>
        {(qRaw || letterFilter) && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-[var(--ar-gray-600)]">
              {qRaw && letterFilter && (
                <>
                  Pretraga: &quot;{qRaw}&quot; · Slovo: {letterFilter}
                </>
              )}
              {qRaw && !letterFilter && <>Pretraga: &quot;{qRaw}&quot;</>}
              {!qRaw && letterFilter && <>Slovo: {letterFilter}</>}
            </span>
            <Link
              href="/sastojci"
              className="ml-4 inline-flex items-center gap-2 rounded px-2 py-1 text-[var(--ar-gray-500)] transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Očisti filtere"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Očisti</span>
            </Link>
          </div>
        )}

        <div className="mt-8 border-t border-[var(--ar-gray-200)] bg-white py-6">
          <p className="mb-4 text-sm font-medium text-[var(--ar-gray-600)]">
            Pronađite sastojak po početnom slovu:
          </p>
          <div className="flex flex-wrap gap-[0.24rem]">
            {SERBIAN_LETTERS.map((letter) => {
              const hasIngredients = lettersWithData.has(letter);
              const isActive = letterFilter === letter;
              if (hasIngredients) {
                const href = isActive
                  ? qRaw
                    ? `/sastojci?q=${encodeURIComponent(qRaw)}`
                    : "/sastojci"
                  : `/sastojci?letter=${letter}${qRaw ? `&q=${encodeURIComponent(qRaw)}` : ""}`;
                return (
                  <Link
                    key={letter}
                    href={href}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-none border-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-accent)] bg-white text-[var(--ar-gray-900)] hover:bg-[var(--color-accent)]/10"
                    }`}
                  >
                    {letter}
                  </Link>
                );
              }
              return (
                <span
                  key={letter}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-none border border-[var(--ar-gray-100)] bg-[var(--ar-gray-50)] text-sm font-medium text-[var(--ar-gray-200)] opacity-70"
                  aria-hidden
                >
                  {letter}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          {grouped.size === 0 ? (
            <p className="py-12 text-center text-[var(--ar-gray-500)]">
              {q || letterFilter
                ? "Nema sastojaka koji odgovaraju filteru."
                : "Nema unetih sastojaka."}
            </p>
          ) : (
            <div className="space-y-10">
              {sortedLetters.map((letter) => {
                const list = grouped.get(letter)!;
                return (
                  <section key={letter} id={`letter-${letter}`}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-none bg-[var(--color-primary)] text-lg font-bold !text-white">
                      {letter}
                    </div>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
                      {list.map((name) => (
                        <li key={name} className="border-t border-[#cdcfd1]">
                          <Link
                            href={`/sastojci/${encodeURIComponent(name)}`}
                            className="text-[var(--ar-gray-700)] hover:text-[var(--color-primary)] hover:underline"
                          >
                            {name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
