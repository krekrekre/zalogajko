import Link from "next/link";
import { ArticleForm } from "../ArticleForm";

export const metadata = {
  title: "Novi članak | Admin Blog",
};

export default function AdminBlogNewPage() {
  return (
    <div>
      <Link
        href="/admin/blog"
        className="text-sm text-[var(--ar-primary)] hover:underline"
      >
        ← Nazad na blog
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-[var(--ar-gray-900)]">
        Novi članak
      </h1>
      <ArticleForm
        action="create"
        submitLabel="Sačuvaj članak"
      />
    </div>
  );
}
