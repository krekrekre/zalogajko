import { createClient } from "@/lib/supabase/server";
import { AdminCommentsList } from "./AdminCommentsList";

type RecipeRef = { id: string; title_sr: string; slug: string };

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status === "approved" || status === "denied" ? status : "pending";

  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      recipe_id,
      user_id,
      content,
      status,
      created_at,
      reviewed_at,
      recipe:recipes(id, title_sr, slug)
    `
    )
    .eq("status", filter)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-600">
        Greška pri učitavanju: {error.message}
      </div>
    );
  }

  const rows = (comments ?? []).map((c) => {
    const recipeRaw = c.recipe as unknown;
    const recipeObj = Array.isArray(recipeRaw) ? recipeRaw[0] : recipeRaw;
    const recipe =
      recipeObj &&
      typeof recipeObj === "object" &&
      "id" in recipeObj &&
      "title_sr" in recipeObj &&
      "slug" in recipeObj
        ? (recipeObj as RecipeRef)
        : null;

    return {
    id: c.id,
    recipe_id: c.recipe_id,
    user_id: c.user_id,
    content: c.content ?? "",
    status: c.status,
    created_at: c.created_at,
    reviewed_at: c.reviewed_at ?? null,
    recipe,
  };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ar-gray-900)]">
        Komentari
      </h1>
      <div className="mt-4 flex gap-2 border-b border-[var(--ar-gray-200)]">
        <a
          href="/admin/comments?status=pending"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "pending"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Na čekanju
        </a>
        <a
          href="/admin/comments?status=approved"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "approved"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Odobrene
        </a>
        <a
          href="/admin/comments?status=denied"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "denied"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Odbijene
        </a>
      </div>
      <AdminCommentsList comments={rows} currentFilter={filter} />
    </div>
  );
}
