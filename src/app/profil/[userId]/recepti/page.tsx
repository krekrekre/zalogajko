import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicProfile, createMinimalProfile, getProfileDisplayName } from "@/lib/profile";
import { RecipeCard } from "@/components/RecipeCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const profile = await getPublicProfile(userId);
  const name = profile?.username?.trim() || "Korisnik";
  return {
    title: `Recepti korisnika ${name} | Profil`,
    description: `Svi objavljeni recepti korisnika ${name}.`,
  };
}

export default async function UserRecipesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const profileRow = await getPublicProfile(userId);
  const profile = profileRow ?? createMinimalProfile(userId);
  const displayName = getProfileDisplayName(profile);

  const { data: recipesData } = await supabase
    .from("recipes")
    .select("id, slug, title_sr, image_url, prep_time_minutes, cook_time_minutes")
    .eq("author_id", userId)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const recipes = (recipesData || []) as Array<{
    id: string;
    slug: string;
    title_sr: string;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
  }>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        className="text-xs uppercase tracking-wide text-[var(--ar-gray-700)] sm:text-sm"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:underline">
          Početna
        </Link>
        <span className="mx-2 text-[var(--ar-gray-400)]">&gt;</span>
        <Link href={`/profil/${userId}`} className="hover:underline">
          Profil
        </Link>
        <span className="mx-2 text-[var(--ar-gray-400)]">&gt;</span>
        <span className="text-[var(--ar-gray-700)]" aria-current="page">
          Recepti
        </span>
      </nav>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Recepti korisnika {displayName}
      </h1>

      {recipes.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      ) : (
        <p className="mt-8 text-gray-500">Ovaj korisnik još nije objavio nijedan recept.</p>
      )}

      <Link
        href={`/profil/${userId}`}
        className="mt-8 inline-block text-sm font-medium text-[var(--color-orange)] hover:underline"
      >
        ← Nazad na profil
      </Link>
    </div>
  );
}
