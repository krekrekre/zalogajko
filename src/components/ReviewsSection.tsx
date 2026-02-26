"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface ReviewsSectionProps {
  recipeId: string;
}

function getReviewAuthor(userId: string) {
  return "Korisnik";
}

export function ReviewsSection({ recipeId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase
      .from("reviews")
      .select("id, content, created_at, user_id")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) || []));
  }, [recipeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("reviews").insert({
      recipe_id: recipeId,
      user_id: user.id,
      content: content.trim(),
    });
    setContent("");
    const { data } = await supabase
      .from("reviews")
      .select("id, content, created_at, user_id")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setSubmitting(false);
  }

  return (
    <div className="no-print mt-8">
      <h2 className="text-xl font-semibold text-[var(--ar-gray-700)]">Recenzije</h2>
      {user ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Napišite svoju recenziju..."
            rows={3}
            className="w-full rounded-xl border border-[var(--ar-gray-200)] px-4 py-3 text-[var(--ar-gray-700)] placeholder-[var(--ar-gray-500)] focus:border-[var(--ar-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ar-primary)]"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-lg bg-[var(--ar-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)] disabled:opacity-50"
          >
            {submitting ? "Šaljem..." : "Pošalji recenziju"}
          </button>
        </form>
      ) : (
        <p className="mt-2 text-sm text-[var(--ar-gray-500)]">
          <a href="/login" className="font-medium text-[var(--ar-primary)] hover:underline">
            Prijavite se
          </a>{" "}
          da biste ostavili recenziju.
        </p>
      )}
      <div className="mt-6 space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)] p-4">
            <p className="text-[var(--ar-gray-700)]">{r.content}</p>
            <p className="mt-2 text-sm text-[var(--ar-gray-500)]">
              {getReviewAuthor(r.user_id)} •{" "}
              {new Date(r.created_at).toLocaleDateString("sr-RS")}
            </p>
          </div>
        ))}
      </div>
      {reviews.length === 0 && (
        <p className="mt-4 text-sm text-[var(--ar-gray-500)]">
          Još nema recenzija. Budite prvi!
        </p>
      )}
    </div>
  );
}
