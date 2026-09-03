"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { followUserAction, unfollowUserAction } from "@/app/profil/[userId]/actions";

interface FollowButtonProps {
  profileUserId: string;
  initialFollowing: boolean;
  viewerId: string | null;
}

export function FollowButton({
  profileUserId,
  initialFollowing,
  viewerId,
}: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!viewerId || viewerId === profileUserId) return null;

  async function handleToggle() {
    if (following) {
      setConfirmOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await followUserAction(profileUserId);
      if (error) {
        setError(error);
        return;
      }
      setFollowing(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmUnfollow() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await unfollowUserAction(profileUserId);
      if (error) {
        setError(error);
        return;
      }
      setFollowing(false);
      setConfirmOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        variant="outline"
        className={
          following
            ? "cursor-pointer rounded-none border-red-500 !bg-transparent text-red-600 hover:!bg-red-50 hover:text-red-700 hover:border-red-600"
            : "cursor-pointer !bg-transparent rounded-none border-[var(--color-orange)] text-[var(--color-orange)] hover:!bg-[var(--ar-gray-100)] hover:text-[var(--color-orange)]"
        }
        aria-pressed={following}
      >
        {following ? (
          <>
            <Minus className="mr-1.5 h-4 w-4" />
            Ne prati
          </>
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" />
            Prati
          </>
        )}
      </Button>
      {error && (
        <p role="alert" className="w-full text-sm text-red-600">
          {error}
        </p>
      )}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unfollow-confirm-title"
        >
          <div className="w-full max-w-sm rounded-none border border-[var(--ar-gray-200)] bg-white p-6 shadow-xl">
            <h2
              id="unfollow-confirm-title"
              className="text-lg font-semibold text-[var(--color-primary)]"
            >
              Prestati sa praćenjem?
            </h2>
            <p className="mt-2 text-sm text-[var(--ar-gray-600)]">
              Više nećete dobijati obaveštenja o novim receptima ovog korisnika.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setConfirmOpen(false)}
                className="cursor-pointer rounded-none"
              >
                Otkaži
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleConfirmUnfollow}
                className="cursor-pointer rounded-none bg-red-600 text-white hover:bg-red-700"
              >
                {loading ? "Uklanjanje..." : "Prestani da pratiš"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
