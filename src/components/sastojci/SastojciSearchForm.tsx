"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SastojciSearchForm({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? defaultValue ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const value =
      (form.elements.namedItem("q") as HTMLInputElement)?.value?.trim() ?? "";
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) params.set("q", value);
    else params.delete("q");
    params.delete("letter");
    const query = params.toString();
    router.push(query ? `/sastojci?${query}` : "/sastojci");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-stretch rounded-none border border-[var(--ar-gray-200)] bg-white focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20"
    >
      <input
        type="search"
        name="q"
        key={q}
        defaultValue={q}
        placeholder="Pretraži"
        className="min-w-0 flex-1 rounded-none border-0 bg-transparent py-2.5 pl-4 pr-2 text-[var(--ar-gray-900)] placeholder:text-[var(--ar-gray-400)] focus:outline-none focus:ring-0"
        aria-label="Pretraži sastojke"
      />
      <button
        type="submit"
        className="flex shrink-0 cursor-pointer items-center justify-center border-l border-[var(--ar-gray-200)] px-4 text-[var(--ar-gray-600)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)]"
        aria-label="Pretraži"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
