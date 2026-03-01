import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getProfileDisplayName, ensureAuthorNameFromAuth } from "@/lib/profile";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profil");

  let profile = await getProfile(user.id);
  if (!profile) redirect("/login?next=/profil");
  profile = await ensureAuthorNameFromAuth(user.id, profile, user.user_metadata ?? undefined);

  const stats = await getProfileStats(user.id);

  const [authoredRes, savedRes] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, slug, title_sr, image_url, prep_time_minutes, cook_time_minutes")
      .eq("author_id", user.id)
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(6),
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
              <h2 className="text-xl font-semibold text-[var(--ar-gray-900)]">
                Moji recepti
              </h2>
              {authoredRecipes.length > 0 ? (
                <>
                  <Link
                    href="/moji-recepti/autorski"
                    className="mt-2 inline-block text-sm font-medium text-[var(--color-orange)] hover:underline"
                  >
                    Otvori sve moje recepte →
                  </Link>
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
                      className="mt-4 inline-block text-sm font-medium text-[var(--color-orange)] hover:underline"
                    >
                      Vidi sve recepte ({stats.recipeCount}) →
                    </Link>
                  )}
                </>
              ) : (
                <p className="mt-4 text-[var(--ar-gray-500)]">
                  Još niste objavili nijedan recept.{" "}
                  <Link href="/recepti/novo" className="text-[var(--color-orange)] hover:underline">
                    Dodaj prvi recept
                  </Link>
                </p>
              )}
            </section>

            <section className="mt-10 border-t border-[var(--ar-gray-200)] pt-10">
              <h2 className="text-xl font-semibold text-[var(--ar-gray-900)]">
                Sačuvani recepti
              </h2>
              <Link
                href="/moji-recepti"
                className="mt-2 inline-block text-sm font-medium text-[var(--color-orange)] hover:underline"
              >
                Otvori sve sačuvane recepte →
              </Link>
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
                  <Link href="/recepti" className="text-[var(--color-orange)] hover:underline">
                    Pregledaj recepte
                  </Link>
                </p>
              )}
              {recipes.length > 4 && (
                <Link
                  href="/moji-recepti"
                  className="mt-4 inline-block text-sm font-medium text-[var(--color-orange)] hover:underline"
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
