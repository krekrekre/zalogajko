import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicProfile, createMinimalProfile, getProfileDisplayName } from "@/lib/profile";
import {
  isFollowing,
} from "@/lib/follows";
import { getProfileStats } from "@/lib/profile-stats";
import { ProfileDisplay } from "@/components/profile/ProfileDisplay";
import { FollowButton } from "@/components/profile/FollowButton";
import { RecipeCard } from "@/components/RecipeCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const profile = await getPublicProfile(userId);
  const name =
    profile?.username?.trim() || "Korisnik";
  return {
    title: `${name} | Profil`,
    description: profile?.about_me?.slice(0, 160) || `Profil korisnika ${name}.`,
  };
}

export default async function PublicProfilPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const profileRow = await getPublicProfile(userId);
  // Show profile even if they have no row yet (e.g. never visited /profil)
  const profile = profileRow ?? createMinimalProfile(userId);

  const [following, stats] = await Promise.all([
    viewer ? isFollowing(viewer.id, userId) : false,
    getProfileStats(userId),
  ]);

  const recipeCount = stats.recipeCount;

  const { data: recipesData } = await supabase
    .from("recipes")
    .select("id, slug, title_sr, image_url, prep_time_minutes, cook_time_minutes")
    .eq("author_id", userId)
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(6);

  const recipes = (recipesData || []) as Array<{
    id: string;
    slug: string;
    title_sr: string;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
  }>;

  const displayName = getProfileDisplayName(profile);

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
                Profil
              </span>
            </nav>

            <div className="mt-6 border border-[color:color-mix(in_srgb,black_20%,transparent)] bg-[#ffffff] p-4 sm:p-6">
              <ProfileDisplay
                profile={profile}
                displayName={displayName}
                stats={stats}
                actionsAfterName={
                  <FollowButton
                    profileUserId={userId}
                    initialFollowing={following}
                    viewerId={viewer?.id ?? null}
                  />
                }
              />
              {viewer?.id === userId && (
                <Link
                  href="/profil"
                  className="mt-4 inline-block text-sm font-medium text-[var(--color-orange)] hover:underline"
                >
                  Uredi moj profil →
                </Link>
              )}
            </div>

            {recipes.length > 0 && (
              <section className="mt-10 border-t border-[var(--ar-gray-200)] pt-10">
                <h2 className="text-xl font-semibold text-[var(--ar-gray-900)]">
                  Recepti korisnika
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
                  {recipes.map((r) => (
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
                {recipeCount > 6 && (
                  <Link
                    href={`/profil/${userId}/recepti`}
                    className="mt-4 inline-block text-sm font-medium text-[var(--color-orange)] hover:underline"
                  >
                    Vidi sve recepte ({recipeCount}) →
                  </Link>
                )}
              </section>
            )}
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
