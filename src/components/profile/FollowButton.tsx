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

  if (!viewerId || viewerId === profileUserId) return null;

  async function handleToggle() {
    if (following) {
      const confirmed = window.confirm("Da li ste sigurni da želite da prestanete da pratite ovog korisnika?");
      if (!confirmed) return;
    }
    setLoading(true);
    setError(null);
    try {
      if (following) {
        const { error } = await unfollowUserAction(profileUserId);
        if (error) {
          setError(error);
          return;
        }
        setFollowing(false);
      } else {
        const { error } = await followUserAction(profileUserId);
        if (error) {
          setError(error);
          return;
        }
        setFollowing(true);
      }
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
    </div>
  );
}
