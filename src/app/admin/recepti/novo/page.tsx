import Link from "next/link";
import { AddRecipeForm } from "@/components/AddRecipeForm";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";

export const metadata = {
  title: "Dodaj recept | Recepti",
};

export default async function NewRecipePage() {
  await requireUser("/admin/recepti/novo");
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug, name_sr, type")
    .order("type")
    .order("sort_order");
  const categories = (cats || []) as Array<{ id: string; slug: string; name_sr: string; type: string }>;

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm text-[var(--color-orange)] hover:text-[var(--ar-primary-hover)]">
        ← Nazad
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-[var(--color-primary)]">Dodaj novi recept</h1>
      <AddRecipeForm categories={categories} />
    </div>
  );
}
