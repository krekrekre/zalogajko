"use server";

import { createClient } from "@/lib/supabase/server";
import { followUser, unfollowUser } from "@/lib/follows";

export async function followUserAction(followingId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Morate biti prijavljeni da biste pratili korisnike." };
  return followUser(user.id, followingId);
}

export async function unfollowUserAction(followingId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Niste prijavljeni." };
  return unfollowUser(user.id, followingId);
}
