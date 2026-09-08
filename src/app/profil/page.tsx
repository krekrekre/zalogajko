import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";
import { bootstrapProfileForUser, getProfileDisplayName } from "@/lib/profile";
import { getProfileStats } from "@/lib/profile-stats";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileDisplay } from "@/components/profile/ProfileDisplay";
import { ProfilePreviewSection } from "@/components/profile/ProfilePreviewSection";
import { RecipeCard } from "@/components/RecipeCard";

export const metadata = {
  title: "Moj profil | Recepti",
  description: "Upravljajte svojim profilom i sačuvanim receptima.",
};

export default async function ProfilPage() {
  const user = await requireUser("/profil");
  const supabase = await createClient();

  const profile = await bootstrapProfileForUser(user);
  if (!profile) {
    throw new Error("Profil nije mogao biti učitan.");
  }

  const stats = await getProfileStats(user.id);

  const [authoredRes, pendingRes, savedRes] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, slug, title_sr, image_url, prep_time_minutes, cook_time_minutes")
      .eq("author_id", user.id)
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(6),
    // A submitted recipe is invisible everywhere until an admin approves it,
    // so show the author it is queued rather than letting it seem lost.
    supabase
      .from("recipes")
      .select("id, title_sr, created_at")
      .eq("author_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_recipes")
      .select("recipe_id")
      .eq("user_id", user.id),
  ]);

  const authoredRecipes = (authoredRes.data || []) as Array<{
    id: string;
    slug: string;
    title_sr: string;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
  }>;

  const pendingRecipes = (pendingRes.data || []) as Array<{
    id: string;
    title_sr: string;
    created_at: string;
  }>;

  const recipeIds = [...new Set((savedRes.data || []).map((r) => r.recipe_id))];
  let recipes: typeof authoredRecipes = [];
  if (recipeIds.length > 0) {
    const { data } = await supabase
      .from("recipes")
      .select("id, slug, title_sr, image_url, prep_time_minutes, cook_time_minutes")
      .in("id", recipeIds)
      .eq("status", "published");
    recipes = (data || []) as typeof recipes;
  }

  const displayName = getProfileDisplayName(profile, user.email?.split("@")[0] || undefined);

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="mx-auto max-w-[1060px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:gap-[96px] lg:[grid-template-columns:600px_300px]">
          <article className="min-w-0 bg-[#ffffff]">
            <nav
              className="text-xs uppercase tracking-wide text-[var(--ar-gray-700)] sm:text-sm"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:underline">
                Početna
              </Link>
              <span className="mx-2 text-[var(--ar-gray-400)]">&gt;</span>
              <span className="text-[var(--ar-gray-700)]" aria-current="page">
                Moj profil
              </span>
            </nav>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-[var(--ar-gray-900)] sm:text-4xl">
              Moj profil
            </h1>

            <ProfilePreviewSection>
              <ProfileDisplay
                profile={profile}
                displayName={displayName}
                compact
                stats={stats}
              />
            </ProfilePreviewSection>

            <div className="mt-8 border border-[color:color-mix(in_srgb,black_20%,transparent)] bg-[#ffffff] p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-[var(--ar-gray-900)]">
                Lični podaci
              </h2>
              <ProfileForm
                userId={user.id}
                profile={profile}
                userEmail={user.email ?? ""}
              />
            </div>

            <section className="mt-8 border-t border-[var(--ar-gray-200)] pt-8">
              <header className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-[var(--ar-gray-900)]">
                  Moji recepti
                </h2>
                {authoredRecipes.length > 0 && (
                  <Link href="/moji-recepti/autorski" className="shrink-0 border-2 border-[var(--color-primary)] bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)]">
                    Vidi sve
                  </Link>
                )}
              </header>
              {authoredRecipes.length > 0 ? (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {authoredRecipes.slice(0, 6).map((r) => (
                      <RecipeCard
                        key={r.id}
                        slug={r.slug}
                        title={r.title_sr}
                        imageUrl={r.image_url}
                        prepTime={r.prep_time_minutes}
                        cookTime={r.cook_time_minutes}
                      />
                    ))}
                  </div>
                  {stats.recipeCount > 6 && (
                    <Link
                      href="/moji-recepti/autorski"
                      className="mt-4 inline-block text-sm font-medium text-[var(--ar-primary-ink)] hover:underline"
                    >
                      Vidi sve recepte ({stats.recipeCount}) →
                    </Link>
                  )}
                </>
              ) : (
                <p className="mt-4 text-[var(--ar-gray-500)]">
                  Još niste objavili nijedan recept.{" "}
                  <Link href="/recepti/novo" className="text-[var(--ar-primary-ink)] hover:underline">
                    Dodaj prvi recept
                  </Link>
                </p>
              )}

              {pendingRecipes.length > 0 && (
                <div className="mt-6 border border-[var(--ar-gray-200)] bg-[#f1f1e6] p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-primary)]">
                    Čekaju odobrenje ({pendingRecipes.length})
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
                    Administrator ih pregleda pre objavljivanja. Do tada nisu
                    vidljivi na sajtu.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {pendingRecipes.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                      >
                        <span className="font-medium text-[var(--color-primary)]">
                          {r.title_sr}
                        </span>
                        <span className="text-[var(--ar-gray-600)]">
                          Poslato {new Date(r.created_at).toLocaleDateString("sr-RS")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="mt-10 border-t border-[var(--ar-gray-200)] pt-10">
              <header className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-[var(--ar-gray-900)]">
                  Sačuvani recepti
                </h2>
                {recipes.length > 0 && (
                  <Link href="/moji-recepti" className="shrink-0 border-2 border-[var(--color-primary)] bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)]">
                    Vidi sve
                  </Link>
                )}
              </header>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
                {recipes.slice(0, 4).map((r) => (
                  <RecipeCard
                    key={r.id}
                    slug={r.slug}
                    title={r.title_sr}
                    imageUrl={r.image_url}
                    prepTime={r.prep_time_minutes}
                    cookTime={r.cook_time_minutes}
                  />
                ))}
              </div>
              {recipes.length === 0 && (
                <p className="mt-4 text-[var(--ar-gray-500)]">
                  Niste sačuvali nijedan recept.{" "}
                  <Link href="/recepti" className="text-[var(--ar-primary-ink)] hover:underline">
                    Pregledaj recepte
                  </Link>
                </p>
              )}
              {recipes.length > 4 && (
                <Link
                  href="/moji-recepti"
                  className="mt-4 inline-block text-sm font-medium text-[var(--ar-primary-ink)] hover:underline"
                >
                  Prikaži svih {recipes.length} sačuvanih recepta →
                </Link>
              )}
            </section>
          </article>

          <aside className="hidden min-w-0 lg:block" aria-label="Reklame">
            <div className="sticky top-8 min-h-[400px] rounded-xl border border-dashed border-[var(--ar-gray-300)] bg-[var(--ar-gray-50)] flex items-center justify-center text-sm text-[var(--ar-gray-500)]">
              Reklama (300×250)
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
