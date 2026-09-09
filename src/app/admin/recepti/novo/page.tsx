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
    <div className="mx-auto max-w-[1060px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-[760px]">
        <Link
          href="/"
          className="text-xs uppercase tracking-wide text-[var(--ar-gray-700)] hover:underline sm:text-sm"
        >
          ← Nazad
        </Link>
        <h1 className="mt-3 break-words text-3xl font-bold leading-tight text-[var(--ar-gray-900)] sm:text-4xl lg:text-[46px]">
          Dodaj novi recept
        </h1>
        <p className="mt-4 max-w-[60ch] leading-relaxed text-[var(--ar-gray-700)]">
          Recept koji doda administrator ide odmah u objavu.
        </p>
        <AddRecipeForm categories={categories} />
      </div>
    </div>
  );
}
