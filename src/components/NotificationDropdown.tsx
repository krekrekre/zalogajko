"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

const STORAGE_KEY = (uid: string) => `notification-last-seen-${uid}`;

type NotificationRecipe = {
  id: string;
  slug: string;
  title_sr: string;
  image_url: string | null;
  author_name: string | null;
  recipe_categories?: Array<{
    category?: { name_sr: string; slug: string };
  }>;
};

export function NotificationDropdown() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [recipes, setRecipes] = useState<NotificationRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [lastSeenAt, setLastSeenAt] = useState<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Hydrate lastSeenAt from localStorage when user is set
  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY(user.id));
    if (raw) {
      const t = parseInt(raw, 10);
      if (!Number.isNaN(t)) setLastSeenAt(t);
    }
  }, [user]);

  // Fetch notification count: recipes created AFTER lastSeenAt (or last 7 days if never seen)
  // Notifications disappear 24 hours after being seen (one day window)
  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      // Start from lastSeenAt, but cap at 24 hours ago (notifications expire after 1 day)
      const since = lastSeenAt
        ? new Date(Math.max(lastSeenAt, oneDayAgo)).toISOString()
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: follows } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);
      const followingIds = (follows ?? []).map((f) => f.following_id);
      if (followingIds.length === 0 || cancelled) {
        if (!cancelled) setCount(0);
        return;
      }
      const { count: recipeCount } = await supabase
        .from("recipes")
        .select("id", { count: "exact", head: true })
        .in("author_id", followingIds)
        .eq("status", "published")
        .gt("created_at", since);
      if (!cancelled) setCount(recipeCount ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, lastSeenAt]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  }, [clearCloseTimer]);

  const handleEnter = useCallback(async () => {
    clearCloseTimer();
    setOpen(true);
    if (user && typeof window !== "undefined") {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY(user.id), String(now));
      setLastSeenAt(now);
    }
    setCount(0);
    if (!user) {
      setRecipes([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: follows } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", user.id);
    const followingIds = (follows ?? []).map((f) => f.following_id);
    if (followingIds.length === 0) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    // Apply 24-hour window: notifications expire one day after being seen
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const since = new Date(Math.max(lastSeenAt ?? 0, oneDayAgo)).toISOString();

    const { data: recipeRows } = await supabase
      .from("recipes")
      .select(
        `
        id,
        slug,
        title_sr,
        image_url,
        author_name,
        recipe_categories(category:categories(name_sr, slug))
      `
      )
      .in("author_id", followingIds)
      .eq("status", "published")
      .gt("created_at", since)
      .order("created_at", { ascending: false })
      .limit(7);
    setRecipes((recipeRows ?? []) as unknown as NotificationRecipe[]);
    setLoading(false);
  }, [user, lastSeenAt]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  // Don't render for guests
  if (!user) return null;

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-label="Obaveštenja"
        aria-expanded={open}
        className="relative flex items-center justify-center p-2 text-[var(--color-accent)] hover:text-[var(--ar-accent-hover)] transition-colors rounded-none cursor-pointer"
      >
        <Bell className="w-5 h-5" strokeWidth={2} />
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-400 text-[11px] font-bold leading-none"
            style={{ color: "#ffffff" }}
            aria-label={`${count} novih obaveštenja`}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full pt-2 z-[100] min-w-[300px] max-w-[340px] max-h-[70vh] overflow-y-auto border border-[var(--ar-gray-200)] bg-white shadow-xl rounded-none py-2"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
          role="menu"
        >
          <div className="px-3 py-1 border-b border-[var(--ar-gray-200)]">
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">
              Nova objava od autora koje pratite
            </h3>
          </div>
          {loading ? (
            <div className="px-4 py-8 text-center text-[var(--ar-gray-500)] text-sm">
              Učitavanje…
            </div>
          ) : recipes.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--ar-gray-500)] text-sm">
              Nema novih objava
            </div>
          ) : (
            <ul className="py-1">
              {recipes.map((r) => {
                const categorySlug =
                  r.recipe_categories?.[0]?.category?.slug ?? "ostalo";
                const categoryName =
                  r.recipe_categories?.[0]?.category?.name_sr ?? "";
                const href = `/recepti/${categorySlug}/${r.slug}`;
                return (
                  <li key={r.id}>
                    <Link
                      href={href}
                      className="flex gap-3 px-3 py-2.5 hover:bg-[var(--ar-gray-200)] transition-colors"
                      role="menuitem"
                    >
                      <div className="relative shrink-0 w-14 h-14 rounded-none overflow-hidden bg-[var(--ar-gray-100)]">
                        <Image
                          src={r.image_url || PLACEHOLDER_IMAGES.default}
                          alt={r.title_sr}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[var(--color-orange)]">
                          {r.author_name || "Autor"}
                        </p>
                        <p className="text-sm font-medium text-[var(--color-primary)] line-clamp-2">
                          {r.title_sr}
                        </p>
                        {categoryName && (
                          <p className="text-xs text-[var(--ar-gray-500)] mt-0.5">
                            {categoryName}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
