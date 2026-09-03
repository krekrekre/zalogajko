"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

export async function approveComment(commentId: string): Promise<string | null> {
  const user = await requireAdmin("/admin/comments");
  const supabase = await createClient();

  const { error } = await supabase
    .from("comments")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", commentId);

  if (error) return error.message;
  revalidatePath("/admin");
  revalidatePath("/admin/comments");
  return null;
}

export async function denyComment(commentId: string): Promise<string | null> {
  const user = await requireAdmin("/admin/comments");
  const supabase = await createClient();

  const { error } = await supabase
    .from("comments")
    .update({
      status: "denied",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", commentId);

  if (error) return error.message;
  revalidatePath("/admin");
  revalidatePath("/admin/comments");
  return null;
}
