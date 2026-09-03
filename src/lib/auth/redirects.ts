const DEFAULT_NEXT_PATH = "/";

export function getSafeNextPath(
  value: string | null | undefined,
  fallback = DEFAULT_NEXT_PATH,
): string {
  if (!value) return fallback;

  const next = value.trim();
  if (
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(next)
  ) {
    return fallback;
  }

  try {
    const url = new URL(next, "https://example.local");
    if (url.origin !== "https://example.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}` || fallback;
  } catch {
    return fallback;
  }
}

export function getLoginPath(nextPath: string): string {
  return `/login?next=${encodeURIComponent(getSafeNextPath(nextPath))}`;
}
