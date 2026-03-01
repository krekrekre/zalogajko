"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfile as updateProfileDb } from "@/lib/profile";

export type ProfileFormState = { error: string | null; success?: boolean };

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Niste prijavljeni." };

  const author_name = (formData.get("author_name") as string)?.trim() || null;
  const first_name = (formData.get("first_name") as string)?.trim() || null;
  const last_name = (formData.get("last_name") as string)?.trim() || null;
  const date_of_birth = (formData.get("date_of_birth") as string) || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const about_me = (formData.get("about_me") as string)?.trim() || null;
  const avatar_url = (formData.get("avatar_url") as string) || undefined;

  const { error } = await updateProfileDb(user.id, {
    author_name: author_name || null,
    first_name: first_name || null,
    last_name: last_name || null,
    date_of_birth: date_of_birth || null,
    country,
    location,
    about_me,
    ...(avatar_url !== undefined && { avatar_url: avatar_url || null }),
  });

  if (error) return { error };
  return { error: null, success: true };
}
