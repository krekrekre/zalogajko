import Link from "next/link";
import { AddRecipeForm } from "@/components/AddRecipeForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dodaj recept | Recepti",
};

export default async function NewRecipePage() {
  let user: { id: string } | null = null;
  let categories: Array<{ id: string; slug: string; name_sr: string; type: string }> = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    const { data: cats } = await supabase
      .from("categories")
      .select("id, slug, name_sr, type")
      .order("type")
      .order("sort_order");
    categories = (cats || []) as typeof categories;
  } catch {
    // Supabase not configured
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Dodaj recept</h1>
        <p className="mt-2 text-gray-600">
          Morate biti prijavljeni da biste dodali recept.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-orange-600 hover:text-orange-700"
        >
          Prijavi se →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm text-[var(--color-orange)] hover:text-[var(--ar-primary-hover)]">
        ← Nazad
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-[var(--color-primary)]">Dodaj novi recept</h1>
      <AddRecipeForm userId={user.id} categories={categories} />
    </div>
  );
}
