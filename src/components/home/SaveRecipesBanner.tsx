import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaveRecipesBanner() {
  return (
    <section className="bg-white pt-[7vh] pb-[7vh]">
      <div className="mx-auto max-w-[1220px] border border-[var(--ar-primary)] rounded-none">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--ar-gray-700)]">
              <Heart className="h-6 w-6 shrink-0 fill-[var(--ar-primary)] text-[var(--ar-primary)]" aria-hidden />
              Počnite da čuvate recepte
            </h3>
            <p className="mt-1 text-[var(--ar-gray-500)]">
              Kreirajte nalog besplatno i sačuvajte omiljene recepte na jednom mestu.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 rounded-none">
            <Link href="/signup" style={{ color: "#f1f1e6" }}>
              Registruj se
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
