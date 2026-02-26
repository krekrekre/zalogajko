"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveReview(reviewId: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Niste ulogovani.";

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return "Nemate pravo da odobrite recenziju.";

  const { error } = await supabase
    .from("reviews")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", reviewId);

  if (error) return error.message;
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  return null;
}

export async function denyReview(reviewId: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Niste ulogovani.";

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return "Nemate pravo da odbijete recenziju.";

  const { error } = await supabase
    .from("reviews")
    .update({
      status: "denied",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", reviewId);

  if (error) return error.message;
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  return null;
}
