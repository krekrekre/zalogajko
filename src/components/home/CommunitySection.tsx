import Link from "next/link";

interface Testimonial {
  recipeSlug: string;
  recipeTitle: string;
  quote: string;
  authorName: string;
}

const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    recipeSlug: "sarma",
    recipeTitle: "Sarma",
    quote:
      "Ovaj recept me podsjetio na baku. Savršeno za nedelju i porodicu.",
    authorName: "Marija, Beograd",
  },
  {
    recipeSlug: "gibanica",
    recipeTitle: "Gibanica",
    quote: "Prvi put da mi gibanica ispadne kao iz pekare. Hvala!",
    authorName: "Stefan, Novi Sad",
  },
  {
    recipeSlug: "karadjordjeva",
    recipeTitle: "Karađorđeva šnicla",
    quote: "Jednostavno a efektno. Gosti su bili oduševljeni.",
    authorName: "Ana, Niš",
  },
];

export function CommunitySection() {
  return (
    <section className="bg-white pt-[7vh] pb-[7vh] border-b-0 shadow-none">
      <div className="mx-auto max-w-[1220px]">
        <h2 className="font-dynapuff text-[30px] font-semibold text-[var(--color-primary)]">
          Dom domaćih kuvara
        </h2>
        <p className="mt-2 text-[var(--ar-gray-500)]">
          Naša zajednica je srce ovog sajta. Evo šta kažu domaći kuvari:
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {PLACEHOLDER_TESTIMONIALS.map((t) => (
            <blockquote
              key={t.recipeSlug}
              className="rounded-none border border-[var(--color-primary)] bg-white p-6"
            >
              <p className="text-[var(--ar-gray-700)]">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 text-[var(--color-primary)]">
                <Link
                  href={`/recepti/${t.recipeSlug}`}
                  className="font-semibold hover:underline"
                >
                  {t.recipeTitle}
                </Link>
                <span className="mt-1 block text-sm opacity-90">
                  — {t.authorName}
                </span>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
