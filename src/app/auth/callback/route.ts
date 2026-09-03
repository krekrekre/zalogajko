import { createClient } from "@/lib/supabase/server";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { bootstrapProfileForUser } from "@/lib/profile";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && session?.user) {
      await bootstrapProfileForUser(session.user);
      return NextResponse.redirect(`${origin}${next}`);
    }
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
