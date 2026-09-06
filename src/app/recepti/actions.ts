"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";

/**
 * Public listings are served from the ISR cache, so a recipe published from the
 * browser would otherwise not appear until the window expired. Call this after
 * a successful insert or update.
 *
 * Requires a session: busting the cache is cheap but not free, and there is no
 * reason for an anonymous caller to trigger it.
 */
export async function revalidateRecipeCaches(canonicalPath?: string) {
  const user = await getCurrentUser();
  if (!user) return;

  revalidatePath("/");
  revalidatePath("/recepti");
  revalidatePath("/kategorije");
  revalidatePath("/kuhinja");
  revalidatePath("/moji-recepti/autorski");

  if (canonicalPath?.startsWith("/recepti/")) {
    revalidatePath(canonicalPath);
  }
}
