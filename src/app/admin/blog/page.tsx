import Link from "next/link";
import { getAdminArticles } from "@/lib/queries/articles";
import { AdminBlogList } from "./AdminBlogList";

function getBlogHref(status: string, section: string, q: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (section !== "all") params.set("section", section);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/blog?${query}` : "/admin/blog";
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; section?: string; q?: string }>;
}) {
  const { status, section: sectionParam, q } = await searchParams;
  const filter =
    status === "published" || status === "draft" ? status : "all";
  const sectionFilter =
    sectionParam === "blog" || sectionParam === "saveti" ? sectionParam : "all";
  const searchTerm = (q ?? "").trim();

  const articles = await getAdminArticles({
    status: filter,
    section: sectionFilter,
    q: searchTerm || undefined,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ar-gray-900)]">
        Blog članci
      </h1>
      <p className="mt-1 text-sm text-[var(--ar-gray-600)]">
        Dodavanje, izmena i brisanje blog članaka.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--ar-gray-200)]">
        <div className="flex flex-wrap gap-2">
          <span className="sr-only">Status:</span>
          <Link
            href={getBlogHref("all", sectionFilter, searchTerm)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              filter === "all"
                ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
                : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
            }`}
          >
            Svi
          </Link>
          <Link
            href={getBlogHref("published", sectionFilter, searchTerm)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              filter === "published"
                ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
                : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
            }`}
          >
            Objavljeno
          </Link>
          <Link
            href={getBlogHref("draft", sectionFilter, searchTerm)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              filter === "draft"
                ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
                : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
            }`}
          >
            Nacrt
          </Link>
          <span className="mx-2 border-l border-[var(--ar-gray-300)] py-1" aria-hidden />
          <span className="sr-only">Stranica:</span>
          <Link
            href={getBlogHref(filter, "all", searchTerm)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              sectionFilter === "all"
                ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
                : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
            }`}
          >
            Sve stranice
          </Link>
          <Link
            href={getBlogHref(filter, "blog", searchTerm)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              sectionFilter === "blog"
                ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
                : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
            }`}
          >
            Blog
          </Link>
          <Link
            href={getBlogHref(filter, "saveti", searchTerm)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              sectionFilter === "saveti"
                ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
                : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
            }`}
          >
            Saveti
          </Link>
        </div>
        <Link
          href="/admin/blog/novo"
          className="rounded-none bg-[var(--ar-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)]"
        >
          Novi članak
        </Link>
      </div>
      <form action="/admin/blog" method="get" className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={searchTerm}
            placeholder="Pretraga po naslovu, slugu ili kategoriji"
            className="w-full max-w-md border border-[var(--ar-gray-300)] bg-white px-3 py-2 text-sm text-[var(--ar-gray-900)] outline-none focus:border-[var(--ar-primary)]"
          />
          {filter !== "all" && (
            <input type="hidden" name="status" value={filter} />
          )}
          {sectionFilter !== "all" && (
            <input type="hidden" name="section" value={sectionFilter} />
          )}
          <button
            type="submit"
            className="cursor-pointer rounded-none bg-[var(--ar-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--ar-primary-hover)]"
          >
            Pretraži
          </button>
          <Link
            href={getBlogHref(filter, sectionFilter, "")}
            className="text-sm text-[var(--ar-gray-600)] hover:underline"
          >
            Očisti
          </Link>
        </div>
      </form>
      <AdminBlogList articles={articles} />
    </div>
  );
}
