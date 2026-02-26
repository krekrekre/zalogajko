import Link from "next/link";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--ar-gray-100)]">
      <header className="border-b border-[var(--ar-gray-200)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="text-lg font-semibold text-[var(--ar-gray-900)]"
          >
            Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/admin"
              className="text-[var(--ar-gray-700)] hover:text-[var(--ar-primary)] hover:underline"
            >
              Pregled
            </Link>
            <Link
              href="/admin/reviews"
              className="text-[var(--ar-gray-700)] hover:text-[var(--ar-primary)] hover:underline"
            >
              Recenzije
            </Link>
            <Link
              href="/admin/comments"
              className="text-[var(--ar-gray-700)] hover:text-[var(--ar-primary)] hover:underline"
            >
              Komentari
            </Link>
            <Link
              href="/admin/recipes"
              className="text-[var(--ar-gray-700)] hover:text-[var(--ar-primary)] hover:underline"
            >
              Recepti
            </Link>
            <Link
              href="/"
              className="text-[var(--ar-gray-500)] hover:underline"
            >
              Nazad na sajt
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AdminGuard>{children}</AdminGuard>
      </main>
    </div>
  );
}
