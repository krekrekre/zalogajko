"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { approveReview, denyReview } from "@/app/admin/reviews/actions";

type ReviewRow = {
  id: string;
  recipe_id: string;
  user_id: string;
  stars: number;
  content: string;
  tags: string[];
  status: string;
  created_at: string;
  reviewed_at: string | null;
  recipe: { id: string; title_sr: string; slug: string } | null;
};

export function AdminReviewsList({
  reviews,
  currentFilter,
}: {
  reviews: ReviewRow[];
  currentFilter: string;
}) {
  const router = useRouter();

  async function handleApprove(id: string) {
    const err = await approveReview(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  async function handleDeny(id: string) {
    const err = await denyReview(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (reviews.length === 0) {
    return (
      <p className="mt-6 text-sm text-[var(--ar-gray-600)]">
        Nema recenzija za prikaz.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-[var(--ar-gray-900)]">
                {r.recipe?.title_sr ?? "Recept"}
              </p>
              <Link
                href={`/recepti/${r.recipe?.slug ?? ""}`}
                className="text-sm text-[var(--ar-primary)] hover:underline"
              >
                /recepti/{r.recipe?.slug ?? r.recipe_id}
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--ar-gray-600)]">
              <span>{r.stars} zvezdica</span>
              <span>
                {new Date(r.created_at).toLocaleString("sr-RS")}
              </span>
            </div>
          </div>
          {r.tags.length > 0 && (
            <p className="mt-2 text-sm text-[var(--ar-gray-600)]">
              Tagovi: {r.tags.join(", ")}
            </p>
          )}
          {r.content && (
            <p className="mt-2 text-sm text-[var(--ar-gray-700)]">
              {r.content}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {currentFilter === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => handleApprove(r.id)}
                  className="cursor-pointer rounded-none bg-[var(--ar-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)]"
                >
                  Odobri
                </button>
                <button
                  type="button"
                  onClick={() => handleDeny(r.id)}
                  className="cursor-pointer rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)]"
                >
                  Odbij
                </button>
              </>
            )}
            {currentFilter === "approved" && (
              <button
                type="button"
                onClick={() => handleDeny(r.id)}
                className="cursor-pointer rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)]"
              >
                Odbij (poništi odobrenje)
              </button>
            )}
            {currentFilter === "denied" && (
              <button
                type="button"
                onClick={() => handleApprove(r.id)}
                className="cursor-pointer rounded-none bg-[var(--ar-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)]"
              >
                Odobri (poništi odbijanje)
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
