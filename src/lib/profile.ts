import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  username: string | null;
  author_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  country: string | null;
  location: string | null;
  about_me: string | null;
  updated_at: string;
};

const TABLE = "profiles";

/**
 * Get author name from auth user_metadata (signup/oauth).
 */
export function getAuthorNameFromMetadata(meta: Record<string, unknown> | null | undefined): string | null {
  if (!meta || typeof meta !== "object") return null;
  const v = (key: string) => (typeof meta[key] === "string" && (meta[key] as string).trim()) || null;
  return v("author_name") || v("full_name") || v("display_name") || v("name") || null;
}

/**
 * If profile has no author_name but auth metadata has one, update profile. Returns updated profile (merged).
 */
export async function ensureAuthorNameFromAuth(
  userId: string,
  profile: Profile,
  authMetadata: Record<string, unknown> | null | undefined
): Promise<Profile> {
  if (profile.author_name?.trim()) return profile;
  const name = getAuthorNameFromMetadata(authMetadata);
  if (!name) return profile;
  const supabase = await createClient();
  await supabase
    .from(TABLE)
    .update({ author_name: name, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return { ...profile, author_name: name };
}

/**
 * Get the current user's profile. Creates a row if missing (from auth.user).
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  if (data) return data as Profile;

  // Insert default row so user can edit
  const { data: inserted, error: insertError } = await supabase
    .from(TABLE)
    .insert({ id: userId })
    .select()
    .single();

  if (insertError) return null;
  return inserted as Profile;
}

/**
 * Get any user's profile by id (for public profile view). Does not create a row.
 * Returns null if the user has no profile row (e.g. never visited /profil).
 */
export async function getPublicProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return data as Profile | null;
}

/** Author name for display (recipes/reviews). Prefer profile.author_name so edits apply everywhere. */
const FALLBACK_AUTHOR = "Domaći kuvar";

export async function getAuthorDisplayName(userId: string | null): Promise<string> {
  if (!userId) return FALLBACK_AUTHOR;
  const profile = await getPublicProfile(userId);
  const name = profile?.author_name?.trim();
  return name || FALLBACK_AUTHOR;
}

/**
 * Batch fetch author display names for many user ids. Returns map userId -> display name.
 */
export async function getAuthorDisplayNames(userIds: string[]): Promise<Record<string, string>> {
  const uniq = [...new Set(userIds)].filter(Boolean);
  if (uniq.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase.from(TABLE).select("id, author_name").in("id", uniq);
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    const id = (row as { id: string; author_name: string | null }).id;
    const name = (row as { id: string; author_name: string | null }).author_name?.trim();
    map[id] = name || FALLBACK_AUTHOR;
  }
  for (const id of uniq) {
    if (!(id in map)) map[id] = FALLBACK_AUTHOR;
  }
  return map;
}

/**
 * Minimal profile for users who have no profile row yet (so public profile page still works).
 */
export function createMinimalProfile(userId: string): Profile {
  return {
    id: userId,
    username: null,
    author_name: null,
    first_name: null,
    last_name: null,
    avatar_url: null,
    date_of_birth: null,
    country: null,
    location: null,
    about_me: null,
    updated_at: new Date().toISOString(),
  };
}

export type ProfileUpdate = {
  username?: string | null;
  author_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  country?: string | null;
  location?: string | null;
  about_me?: string | null;
};

/**
 * Display name for profile page only: first + last name, else username, else author_name, else fallback.
 */
export function getProfileDisplayName(
  profile: Pick<Profile, "first_name" | "last_name" | "username" | "author_name">,
  fallback?: string
): string {
  const first = profile.first_name?.trim() ?? "";
  const last = profile.last_name?.trim() ?? "";
  const full = [first, last].join(" ").trim();
  if (full) return full;
  if (profile.username?.trim()) return profile.username.trim();
  if (profile.author_name?.trim()) return profile.author_name.trim();
  return fallback ?? "Korisnik";
}

/**
 * Update the current user's profile. Only updates provided fields.
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABLE)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return { error: error?.message ?? null };
}
