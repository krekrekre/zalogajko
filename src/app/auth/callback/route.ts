import { createClient } from "@/lib/supabase/server";
import { getAuthorNameFromMetadata } from "@/lib/profile";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && session?.user) {
      const authorName =
        getAuthorNameFromMetadata(session.user.user_metadata as Record<string, unknown>) ||
        session.user.email?.split("@")[0]?.trim() ||
        null;
      const now = new Date().toISOString();
      await supabase.from("profiles").upsert(
        { id: session.user.id, author_name: authorName, updated_at: now },
        { onConflict: "id", ignoreDuplicates: true }
      );
      if (authorName) {
        await supabase.from("profiles").update({ author_name: authorName, updated_at: now })
          .eq("id", session.user.id).is("author_name", null);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
