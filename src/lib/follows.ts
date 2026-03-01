import { createClient } from "@/lib/supabase/server";

const TABLE = "user_follows";

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(TABLE)
    .select("follower_id", { count: "exact", head: true })
    .eq("following_id", userId);
  if (error) return 0;
  return count ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(TABLE)
    .select("following_id", { count: "exact", head: true })
    .eq("follower_id", userId);
  if (error) return 0;
  return count ?? 0;
}

export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (followerId === followingId) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function followUser(
  followerId: string,
  followingId: string
): Promise<{ error: string | null }> {
  if (followerId === followingId) return { error: "Ne možete pratiti sami sebe." };
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).insert({
    follower_id: followerId,
    following_id: followingId,
  });
  return { error: error?.message ?? null };
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  return { error: error?.message ?? null };
}
