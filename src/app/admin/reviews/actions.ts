"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

export async function approveReview(reviewId: string): Promise<string | null> {
  const user = await requireAdmin("/admin/reviews");
  const supabase = await createClient();

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
  const user = await requireAdmin("/admin/reviews");
  const supabase = await createClient();

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
