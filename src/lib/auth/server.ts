import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLoginPath, getSafeNextPath } from "@/lib/auth/redirects";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(getLoginPath(nextPath));
  }

  return user;
}

export async function getIsAdmin(userId?: string | null): Promise<boolean> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user?.id) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return !!data;
}

export async function requireAdmin(nextPath = "/admin") {
  const user = await requireUser(getSafeNextPath(nextPath, "/admin"));
  const admin = await getIsAdmin(user.id);
  if (!admin) {
    redirect("/");
  }

  return user;
}
