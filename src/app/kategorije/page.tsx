import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getListingMetadata } from "@/lib/seo";

export const metadata = getListingMetadata(
  "Kategorije recepta",
  "Pregledajte sve kategorije recepta - od glavnih jela do deserta."
);

export default async function CategoriesPage() {
  let categories: Array<{ slug: string; name_sr: string; type: string }> = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("slug, name_sr, type")
      .order("type")
      .order("sort_order");
    categories = (data || []) as typeof categories;
  } catch {
    categories = [];
  }

  const byType = categories.reduce(
    (acc, c) => {
      if (!acc[c.type]) acc[c.type] = [];
      acc[c.type].push(c);
      return acc;
    },
    {} as Record<string, typeof categories>
  );

  const typeLabels: Record<string, string> = {
    meal_type: "Vrste jela",
    cuisine: "Kuhinje",
    diet: "Dijeta",
    occasion: "Prilika",
    cooking_method: "Način kuvanja",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[var(--ar-gray-700)] sm:text-3xl">Kategorije</h1>
      <p className="mt-2 text-[var(--ar-gray-500)]">
        Pregledajte recepte po kategoriji.
      </p>
      <div className="mt-10 space-y-10">
        {Object.entries(byType).map(([type, cats]) => (
          <div key={type} className="rounded-xl border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)] p-6">
            <h2 className="text-lg font-semibold text-[var(--ar-gray-700)]">
              {typeLabels[type] || type}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {cats.map((c) => (
                <Link
                  key={c.slug}
                  href={`/kategorija/${c.slug}`}
                  className="rounded-lg border border-[var(--ar-gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ar-gray-700)] shadow-sm hover:border-[var(--ar-primary)] hover:bg-[var(--ar-primary-light)] hover:text-[var(--ar-primary)]"
                >
                  {c.name_sr}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <p className="rounded-xl border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)] py-12 text-center text-[var(--ar-gray-500)]">
          Nema kategorija. Pokrenite SQL skriptu u Supabase da dodate početne
          kategorije.
        </p>
      )}
    </div>
  );
}
