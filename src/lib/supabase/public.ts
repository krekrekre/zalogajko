import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon Supabase client that never touches cookies.
 *
 * The cookie-backed client in ./server.ts awaits next/headers cookies(), which
 * opts every route that uses it out of static rendering. Public read paths do
 * not need a session, so they use this instead and stay cacheable. RLS still
 * applies: this key can only see what an anonymous visitor can see.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
