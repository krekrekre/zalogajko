"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  approveRevision,
  denyRevision,
} from "@/app/admin/recipes/revisions/actions";

export type RevisionIngredient = {
  amount: string | null;
  unit_sr: string | null;
  name_sr: string;
};

export type RevisionDirection = {
  step_number: number;
  instruction_sr: string;
};

export type RevisionRow = {
  id: string;
  recipe_id: string;
  status: string;
  created_at: string;
  recipe_title: string;
  recipe_slug: string;
  author_name: string;
  current: {
    ingredients: RevisionIngredient[];
    directions: RevisionDirection[];
  };
  proposed: {
    ingredients: RevisionIngredient[];
    directions: RevisionDirection[];
  };
};

function ingredientLine(i: RevisionIngredient) {
  return [i.amount, i.unit_sr, i.name_sr].filter(Boolean).join(" ");
}

/** Side by side, because the point of the queue is seeing what changed. */
function Column({
  heading,
  ingredients,
  directions,
  tone,
}: {
  heading: string;
  ingredients: RevisionIngredient[];
  directions: RevisionDirection[];
  tone: "current" | "proposed";
}) {
  return (
    <div
      className={`min-w-0 border p-3 ${
        tone === "proposed"
          ? "border-[var(--ar-primary)] bg-[var(--ar-cream)]"
          : "border-[var(--ar-gray-200)] bg-white"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ar-gray-600)]">
        {heading}
      </p>

      <p className="mt-3 text-xs font-semibold text-[var(--ar-gray-700)]">
        Sastojci ({ingredients.length})
      </p>
      <ul className="mt-1 space-y-0.5 text-sm text-[var(--ar-gray-800)]">
        {ingredients.map((i, idx) => (
          <li key={idx}>{ingredientLine(i)}</li>
        ))}
        {ingredients.length === 0 && (
          <li className="text-[var(--ar-gray-500)]">—</li>
        )}
      </ul>

      <p className="mt-3 text-xs font-semibold text-[var(--ar-gray-700)]">
        Koraci ({directions.length})
      </p>
      <ol className="mt-1 space-y-1 text-sm text-[var(--ar-gray-800)]">
        {directions.map((d, idx) => (
          <li key={idx}>
            {d.step_number}. {d.instruction_sr}
          </li>
        ))}
        {directions.length === 0 && (
          <li className="text-[var(--ar-gray-500)]">—</li>
        )}
      </ol>
    </div>
  );
}

export function AdminRevisionsList({
  revisions,
  currentFilter,
}: {
  revisions: RevisionRow[];
  currentFilter: string;
}) {
  const router = useRouter();

  async function handleApprove(revision: RevisionRow) {
    const err = await approveRevision(revision.id, revision.recipe_id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  async function handleDeny(revision: RevisionRow) {
    const err = await denyRevision(revision.id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (revisions.length === 0) {
    return (
      <p className="mt-6 text-sm text-[var(--ar-gray-600)]">
        Nema izmena za prikaz.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {revisions.map((revision) => (
        <div
          key={revision.id}
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium break-words text-[var(--ar-gray-900)]">
                {revision.recipe_title}
              </p>
              <Link
                href={`/recepti/${revision.recipe_slug}`}
                className="text-sm text-[var(--ar-primary)] hover:underline"
              >
                /recepti/{revision.recipe_slug}
              </Link>
              <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
                Autor: {revision.author_name}
              </p>
            </div>
            <span className="text-sm text-[var(--ar-gray-600)]">
              {new Date(revision.created_at).toLocaleString("sr-RS")}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Column
              heading="Trenutno na sajtu"
              ingredients={revision.current.ingredients}
              directions={revision.current.directions}
              tone="current"
            />
            <Column
              heading="Predložene izmene"
              ingredients={revision.proposed.ingredients}
              directions={revision.proposed.directions}
              tone="proposed"
            />
          </div>

          {currentFilter === "pending" && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleApprove(revision)}
                className="cursor-pointer rounded-none bg-[var(--ar-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)]"
              >
                Primeni izmene
              </button>
              <button
                type="button"
                onClick={() => handleDeny(revision)}
                className="cursor-pointer rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)]"
              >
                Odbij
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
