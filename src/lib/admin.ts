import { getIsAdmin } from "@/lib/auth/server";

export async function isAdmin(): Promise<boolean> {
  return getIsAdmin();
}
