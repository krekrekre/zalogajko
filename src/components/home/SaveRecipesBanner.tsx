"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Resolves the session in the browser rather than on the server. Reading the
 * session server-side here forced the whole homepage to render dynamically,
 * which defeated caching for the sake of one line of copy. Header resolves
 * auth the same way.
 */
export function SaveRecipesBanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setIsLoggedIn(!!session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsLoggedIn(!!session?.user);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section className="bg-white pt-[7vh] pb-[7vh]">
      <div className="mx-auto max-w-[1220px] border border-[var(--ar-primary)] rounded-none">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--ar-gray-700)]">
              <Heart className="h-6 w-6 shrink-0 fill-[var(--ar-primary)] text-[var(--ar-primary)]" aria-hidden />
              {isLoggedIn ? "Pregledajte recepte" : "Počnite da čuvate recepte"}
            </h3>
            <p className="mt-1 text-[var(--ar-gray-500)]">
              {isLoggedIn
                ? "Pronađite recepte po kategoriji, sastojcima ili kuhinji i sačuvajte omiljene."
                : "Kreirajte nalog besplatno i sačuvajte omiljene recepte na jednom mestu."}
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 rounded-none">
            <Link
              href={isLoggedIn ? "/recepti" : "/signup"}
              style={{ color: "#f1f1e6" }}
            >
              {isLoggedIn ? "Pregledaj recepte" : "Registruj se"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
