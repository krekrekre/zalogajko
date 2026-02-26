"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { approveComment, denyComment } from "@/app/admin/comments/actions";

type CommentRow = {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  recipe: { id: string; title_sr: string; slug: string } | null;
};

export function AdminCommentsList({
  comments,
  currentFilter,
}: {
  comments: CommentRow[];
  currentFilter: string;
}) {
  const router = useRouter();

  async function handleApprove(id: string) {
    const err = await approveComment(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  async function handleDeny(id: string) {
    const err = await denyComment(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (comments.length === 0) {
    return (
      <p className="mt-6 text-sm text-[var(--ar-gray-600)]">
        Nema komentara za prikaz.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {comments.map((c) => (
        <div
          key={c.id}
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-[var(--ar-gray-900)]">
                {c.recipe?.title_sr ?? "Recept"}
              </p>
              <Link
                href={`/recepti/${c.recipe?.slug ?? ""}`}
                className="text-sm text-[var(--ar-primary)] hover:underline"
              >
                /recepti/{c.recipe?.slug ?? c.recipe_id}
              </Link>
            </div>
            <span className="text-sm text-[var(--ar-gray-600)]">
              {new Date(c.created_at).toLocaleString("sr-RS")}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--ar-gray-700)]">{c.content}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {currentFilter === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => handleApprove(c.id)}
                  className="cursor-pointer rounded-none bg-[var(--ar-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)]"
                >
                  Odobri
                </button>
                <button
                  type="button"
                  onClick={() => handleDeny(c.id)}
                  className="cursor-pointer rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)]"
                >
                  Odbij
                </button>
              </>
            )}
            {currentFilter === "approved" && (
              <button
                type="button"
                onClick={() => handleDeny(c.id)}
                className="cursor-pointer rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)]"
              >
                Odbij (poništi odobrenje)
              </button>
            )}
            {currentFilter === "denied" && (
              <button
                type="button"
                onClick={() => handleApprove(c.id)}
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
