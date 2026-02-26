import Link from "next/link";

interface Category {
  slug: string;
  name_sr: string;
}

const MEAL_TYPE_LINKS: Category[] = [
  { slug: "glavna-jela", name_sr: "Glavna jela" },
  { slug: "supe", name_sr: "Supe" },
  { slug: "salate", name_sr: "Salate" },
  { slug: "deserti", name_sr: "Deserti" },
];

const CUISINE_LINKS: Category[] = [
  { slug: "srpska", name_sr: "Srpska kuhinja" },
  { slug: "balkanska", name_sr: "Balkanska" },
  { slug: "italijanska", name_sr: "Italijanska" },
];

export function TopicHubs() {
  return (
    <section className="border-b border-[var(--ar-gray-200)] bg-white py-12">
      <div className="mx-auto max-w-[1220px]">
        <h2 className="text-[30px] font-bold text-[var(--ar-gray-700)]">
          Istražite kategorije
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
              Vrste jela
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {MEAL_TYPE_LINKS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/kategorija/${c.slug}`}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--ar-gray-700)] transition-colors hover:bg-[var(--ar-primary-light)] hover:text-[var(--ar-primary)]"
                  >
                    {c.name_sr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ar-gray-500)]">
              Kuhinje
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CUISINE_LINKS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/kategorija/${c.slug}`}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--ar-gray-700)] transition-colors hover:bg-[var(--ar-primary-light)] hover:text-[var(--ar-primary)]"
                  >
                    {c.name_sr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--ar-gray-200)] bg-[var(--ar-primary-light)] p-6 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ar-primary)]">
              Svi recepti
            </h3>
            <p className="mt-2 text-sm text-[var(--ar-gray-500)]">
              Pregledajte ceo katalog recepta.
            </p>
            <Link
              href="/recepti"
              className="mt-4 inline-block font-semibold text-[var(--ar-primary)] hover:text-[var(--ar-primary-hover)] hover:underline"
            >
              Pregledaj sve →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
