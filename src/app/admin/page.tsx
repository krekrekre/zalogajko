import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: pendingReviews },
    { count: approvedReviews },
    { count: deniedReviews },
    { count: pendingComments },
    { count: recipesCount },
  ] = await Promise.all([
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "denied"),
    supabase.from("comments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("recipes").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ar-gray-900)]">
        Admin panel
      </h1>
      <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
        Upravljanje recenzijama i komentarima.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          href="/admin/reviews?status=pending"
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4 transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-[var(--ar-gray-600)]">
            Recenzije na čekanju
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ar-gray-900)]">
            {pendingReviews ?? 0}
          </p>
        </Link>
        <Link
          href="/admin/reviews?status=approved"
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4 transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-[var(--ar-gray-600)]">
            Odobrene recenzije
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ar-gray-900)]">
            {approvedReviews ?? 0}
          </p>
        </Link>
        <Link
          href="/admin/reviews?status=denied"
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4 transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-[var(--ar-gray-600)]">
            Odbijene recenzije
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ar-gray-900)]">
            {deniedReviews ?? 0}
          </p>
        </Link>
        <Link
          href="/admin/comments?status=pending"
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4 transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-[var(--ar-gray-600)]">
            Komentari na čekanju
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ar-gray-900)]">
            {pendingComments ?? 0}
          </p>
        </Link>
        <Link
          href="/admin/recipes"
          className="rounded-none border border-[var(--ar-gray-200)] bg-white p-4 transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-[var(--ar-gray-600)]">
            Ukupno recepata
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ar-gray-900)]">
            {recipesCount ?? 0}
          </p>
        </Link>
      </div>
    </div>
  );
}
