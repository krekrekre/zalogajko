"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ANIMAL_AVATAR_URLS } from "@/lib/avatars";

const STAR_LABELS: Record<number, string> = {
  1: "Loše",
  2: "Može bolje",
  3: "Solidno",
  4: "Odlično",
  5: "Sviđa mi se",
};

const REVIEW_TAGS_BY_STAR: Record<number, string[]> = {
  1: ["Nije uspelo", "Nedostaju koraci", "Nedostaju sastojci"],
  2: ["Zbunjujuća uputstva", "Treba poboljšanja"],
  3: ["Nešto nedostaje", "Previše teško"],
  4: ["Ok uz izmene", "Treba više ukusa", "Možda ponovo"],
  5: [
    "Za čuvanje!",
    "Odlični ukusi",
    "Lako za praćenje",
    "Vredi truda",
    "Sviđa se svima",
    "Omiljen u porodici",
  ],
};

const REVIEWS_PAGE_SIZE = 15;

interface RecipeReviewSectionProps {
  recipeId: string;
  recipeTitle: string;
  reviewCount?: number;
}

interface ReviewRow {
  id: string;
  user_id: string;
  author_name: string | null;
  author_avatar_url: string | null;
  stars: number;
  content: string | null;
  tags: string[] | null;
  created_at: string;
}

export function RecipeReviewSection({
  recipeId,
  recipeTitle,
  reviewCount = 0,
}: RecipeReviewSectionProps) {
  const [user, setUser] = useState<{
    id: string;
    email?: string | null;
    user_metadata?: {
      display_name?: string;
      full_name?: string;
      name?: string;
      avatar_url?: string;
      picture?: string;
    } | null;
  } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(REVIEWS_PAGE_SIZE);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUser(data.user));
  }, []);

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    setReviewsError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id,user_id,author_name,author_avatar_url,stars,content,tags,created_at")
      .eq("recipe_id", recipeId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      setReviews([]);
      setReviewsError("Recenzije trenutno nisu dostupne.");
    } else {
      setReviews((data as ReviewRow[] | null) ?? []);
    }
    setLoadingReviews(false);
  }, [recipeId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    setVisibleReviewsCount(REVIEWS_PAGE_SIZE);
  }, [recipeId, reviews.length]);

  const displayStars = hoverRating || rating;
  const hasStars = rating > 0;
  const hasText = reviewText.trim().length > 0;
  const canSubmit = hasStars || hasText; // Stars only, stars+tags, text only, or all

  const tagsForRating = rating > 0 ? (REVIEW_TAGS_BY_STAR[rating] ?? []) : [];

  function resolveUserName() {
    const displayName = user?.user_metadata?.display_name?.trim();
    if (displayName) return displayName;
    const fullName = user?.user_metadata?.full_name?.trim();
    if (fullName) return fullName;
    const name = user?.user_metadata?.name?.trim();
    if (name) return name;
    const emailPrefix = user?.email?.split("@")[0]?.trim();
    if (emailPrefix) return emailPrefix;
    return "Korisnik";
  }

  function resolveReviewerName(review: ReviewRow) {
    if (review.author_name?.trim()) return review.author_name;
    if (user && review.user_id === user.id) return resolveUserName();
    return "Korisnik";
  }

  function resolveUserAvatar() {
    const avatar = user?.user_metadata?.avatar_url?.trim();
    if (avatar) return avatar;
    const picture = user?.user_metadata?.picture?.trim();
    if (picture) return picture;
    if (!user?.id) return null;
    return getAnimalAvatarForUser(user.id);
  }

  function getAnimalAvatarForUser(userId: string) {
    let hash = 0;
    for (let i = 0; i < userId.length; i += 1) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % ANIMAL_AVATAR_URLS.length;
    return ANIMAL_AVATAR_URLS[index];
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleCancel() {
    setRating(0);
    setHoverRating(0);
    setSelectedTags([]);
    setReviewText("");
  }

  async function handleSubmit() {
    if (!user || (!hasStars && !hasText)) return;
    setSubmitting(true);
    setSubmitMessage(null);
    const supabase = createClient();
    try {
      const { error: reviewError } = await supabase.from("reviews").insert({
        recipe_id: recipeId,
        user_id: user.id,
        author_name: resolveUserName(),
        author_avatar_url: resolveUserAvatar(),
        stars: rating || 0,
        content: reviewText.trim() || "",
        tags: selectedTags,
        status: "approved", // Set to "pending" when you want admin moderation
      });
      if (reviewError) throw reviewError;
      if (rating > 0) {
        const { error: ratingError } = await supabase
          .from("ratings")
          .upsert(
            { user_id: user.id, recipe_id: recipeId, stars: rating },
            { onConflict: "user_id,recipe_id" },
          );
        if (ratingError) throw ratingError;
      }
      handleCancel();
      setSubmitMessage("Recenzija/komentar je uspešno postavljen/a.");
      void loadReviews();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : err instanceof Error
            ? err.message
            : "Greška pri slanju.";
      setSubmitMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="rate"
      className="mt-10 scroll-mt-8 border-t border-[var(--ar-gray-200)] pt-8"
    >
      <h2 className="text-2xl font-bold text-[var(--ar-gray-900)] sm:text-[28px]">
        Recenzije / Komentari ({reviewCount.toLocaleString("sr-RS")})
      </h2>

      {!user ? (
        <p className="mt-4 text-sm text-[var(--ar-gray-600)]">
          <Link
            href="/login"
            className="font-medium text-[var(--ar-primary)] underline hover:no-underline"
          >
            Ulogujte se
          </Link>{" "}
          da biste ostavili recenziju.
        </p>
      ) : (
        <div className="mt-6 rounded-none border-[2rem] border-[#f1f1e6] bg-white p-5 sm:p-6">
          <h3 className="text-lg font-bold text-[var(--ar-gray-900)]">
            {recipeTitle}
          </h3>

          <div className="mt-5">
            <p className="text-sm font-bold text-[var(--ar-gray-900)]">
              Moja ocena
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="cursor-pointer rounded-none p-0.5 transition-transform hover:scale-110 focus:outline-none"
                    onClick={() => {
                      setRating(value);
                      setSelectedTags([]);
                    }}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${value} zvezdica`}
                    aria-pressed={rating === value}
                  >
                    <Star
                      className={`size-8 transition-colors ${
                        value <= displayStars
                          ? "fill-red-500 text-red-500"
                          : "text-[var(--ar-gray-300)]"
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="text-sm text-[var(--ar-gray-700)]">
                  {STAR_LABELS[rating]}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold text-[var(--ar-gray-900)]">
              Moja recenzija/komentar
            </p>
            {tagsForRating.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tagsForRating.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  const tagClass = isSelected
                    ? "border-[var(--ar-primary)] bg-[var(--ar-primary)] text-white"
                    : "border-[var(--ar-gray-700)] bg-white text-[var(--ar-gray-700)] hover:bg-[var(--ar-primary)] hover:text-white hover:border-[var(--ar-primary)]";
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={
                        "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors " +
                        tagClass
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Šta mislite o ovom receptu? Da li ste napravili neke izmene ili beleške?"
              rows={4}
              className="mt-3 w-full rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-2 text-[var(--ar-gray-700)] placeholder:text-[var(--ar-gray-500)] focus:border-[var(--ar-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ar-primary)]"
            />
          </div>

          {submitMessage && (
            <p className={`mt-4 text-sm font-medium ${submitMessage.startsWith("Greška") ? "text-red-600" : "text-green-600"}`}>
              {submitMessage}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="cursor-pointer rounded-none bg-transparent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-100)] focus:outline-none active:outline-none disabled:opacity-50"
            >
              Otkaži
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit || submitting}
              className={`cursor-pointer rounded-none px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white focus:outline-none focus:ring-2 focus:ring-[var(--ar-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                canSubmit
                  ? "bg-[var(--ar-primary)] hover:bg-[var(--ar-primary-hover)]"
                  : "bg-[var(--ar-gray-400)]"
              }`}
            >
              {submitting ? "Postavljanje..." : "Postavi"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-[var(--ar-gray-200)] pt-6">
        <h3 className="text-lg font-bold text-[var(--ar-gray-900)]">
          Recenzije/komentari ({reviews.length.toLocaleString("sr-RS") || reviewCount.toLocaleString("sr-RS")})
        </h3>

        {loadingReviews && (
          <p className="mt-3 text-sm text-[var(--ar-gray-600)]">Učitavanje recenzija...</p>
        )}

        {!loadingReviews && reviewsError && (
          <p className="mt-3 text-sm text-red-600">{reviewsError}</p>
        )}

        {!loadingReviews && !reviewsError && reviews.length === 0 && (
          <p className="mt-3 text-sm text-[var(--ar-gray-600)]">
            Još nema odobrenih recenzija za ovaj recept.
          </p>
        )}

        {!loadingReviews && !reviewsError && reviews.length > 0 && (
          <div className="mt-4 divide-y divide-[var(--ar-gray-200)] border-t border-[var(--ar-gray-200)]">
            {reviews.slice(0, visibleReviewsCount).map((review) => (
              <article key={review.id} className="py-5">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={review.author_avatar_url || getAnimalAvatarForUser(review.user_id)}
                    alt={resolveReviewerName(review)}
                    className="h-6 w-6 rounded-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-base font-semibold text-[var(--ar-gray-900)]">
                      {resolveReviewerName(review)}
                    </p>
                    <div className="mt-1 flex items-center justify-start gap-2 text-left">
                      {review.stars > 0 && (
                        <div
                          className="flex gap-0.5"
                          aria-label={`Ocena ${review.stars} od 5`}
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              className={`size-4 ${
                                value <= review.stars
                                  ? "fill-red-500 text-red-500"
                                  : "text-[var(--ar-gray-300)]"
                              }`}
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-sm text-[var(--ar-gray-600)]">
                        {new Date(review.created_at).toLocaleDateString("sr-RS")}
                      </span>
                    </div>
                  </div>
                </div>

                {review.content && (
                  <p className="mt-3 whitespace-pre-line text-[var(--ar-gray-800)]">
                    {review.content}
                  </p>
                )}

                {!!review.tags?.length && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.tags.map((tag) => (
                      <span
                        key={`${review.id}-${tag}`}
                        className="rounded-full border border-[var(--ar-gray-300)] bg-[var(--ar-gray-50)] px-2.5 py-1 text-xs text-[var(--ar-gray-700)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {reviews.length > visibleReviewsCount && (
              <div className="pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleReviewsCount((prev) =>
                      Math.min(prev + REVIEWS_PAGE_SIZE, reviews.length),
                    )
                  }
                  className="inline-block cursor-pointer border-2 border-[var(--color-primary)] bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)] transition-all duration-200 hover:scale-105 hover:bg-[var(--ar-primary)] hover:text-[var(--color-primary)] hover:border-[var(--ar-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ar-primary)] focus-visible:ring-offset-2"
                >
                  Učitaj još
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
