import Image from "next/image";
import type { Profile } from "@/lib/profile";
import type { ProfileStats as ProfileStatsType } from "@/lib/profile-stats";
import { getAnimalAvatarForUser } from "@/lib/avatars";
import { ProfileStats } from "@/components/profile/ProfileStats";

interface ProfileDisplayProps {
  profile: Profile;
  displayName: string;
  /** Optional: show compact single-column layout */
  compact?: boolean;
  /** Optional: render next to the name (e.g. Follow button) */
  actionsAfterName?: React.ReactNode;
  /** Optional: show stats row right below the name */
  stats?: ProfileStatsType;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("sr-RS", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ProfileDisplay({
  profile,
  displayName,
  compact,
  actionsAfterName,
  stats,
}: ProfileDisplayProps) {
  const avatarUrl = profile.avatar_url || getAnimalAvatarForUser(profile.id);
  const hasDob = !!profile.date_of_birth;
  const hasCountry = !!profile.country?.trim();
  const hasLocation = !!profile.location?.trim();
  const hasAbout = !!profile.about_me?.trim();
  const hasFirst = !!profile.first_name?.trim();
  const hasLast = !!profile.last_name?.trim();
  const hasAnyInfo = hasDob || hasCountry || hasLocation || hasAbout || hasFirst || hasLast;
  const authorDisplayName = profile.author_name?.trim() || displayName;

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)] sm:h-28 sm:w-28">
          <Image
            src={avatarUrl}
            alt=""
            fill
            className="object-cover"
            sizes="112px"
            unoptimized={avatarUrl.startsWith("data:")}
          />
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--ar-gray-900)] sm:text-2xl">
              {authorDisplayName}
            </h2>
          </div>
          {actionsAfterName != null ? actionsAfterName : null}
        </div>
      </div>

      {stats != null && (
        <div className="mt-4">
          <ProfileStats stats={stats} />
        </div>
      )}

      {hasAnyInfo && (
        <dl className="flex flex-col gap-3 text-sm">
          {hasFirst && (
            <div className="flex items-baseline gap-2">
              <dt className="font-medium text-[var(--ar-gray-500)]">Ime:</dt>
              <dd className="text-[var(--ar-gray-900)]">{profile.first_name!.trim()}</dd>
            </div>
          )}
          {hasLast && (
            <div className="flex items-baseline gap-2">
              <dt className="font-medium text-[var(--ar-gray-500)]">Prezime:</dt>
              <dd className="text-[var(--ar-gray-900)]">{profile.last_name!.trim()}</dd>
            </div>
          )}
          {hasDob && (
            <div className="flex items-baseline gap-2">
              <dt className="font-medium text-[var(--ar-gray-500)]">Datum rođenja:</dt>
              <dd className="text-[var(--ar-gray-900)]">
                {formatDate(profile.date_of_birth)}
              </dd>
            </div>
          )}
          {hasCountry && (
            <div className="flex items-baseline gap-2">
              <dt className="font-medium text-[var(--ar-gray-500)]">Država:</dt>
              <dd className="text-[var(--ar-gray-900)]">{profile.country}</dd>
            </div>
          )}
          {hasLocation && (
            <div className="flex items-baseline gap-2">
              <dt className="font-medium text-[var(--ar-gray-500)]">Lokacija:</dt>
              <dd className="text-[var(--ar-gray-900)]">{profile.location}</dd>
            </div>
          )}
        </dl>
      )}

      {hasAbout && (
        <p className="text-sm">
          <span className="font-medium text-[var(--ar-gray-500)]">O meni: </span>
          <span className="whitespace-pre-wrap text-[var(--ar-gray-900)]">{profile.about_me}</span>
        </p>
      )}

      {!hasAnyInfo && !compact && (
        <p className="text-sm text-[var(--ar-gray-500)]">
          Ovaj korisnik još nije popunio javne podatke.
        </p>
      )}
    </div>
  );
}
