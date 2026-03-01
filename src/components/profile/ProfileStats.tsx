import type { ProfileStats as ProfileStatsType } from "@/lib/profile-stats";
import { BookOpen, MessageCircle, Image, Users } from "lucide-react";

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

const statConfig = [
  {
    key: "recipeCount" as const,
    label: "Recepti",
    icon: BookOpen,
  },
  {
    key: "reviewCount" as const,
    label: "Recenzije",
    icon: MessageCircle,
  },
  {
    key: "imageCount" as const,
    label: "Slike",
    icon: Image,
  },
  {
    key: "followerCount" as const,
    label: "Pratioci",
    icon: Users,
  },
];

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {statConfig.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="flex flex-col items-center rounded-none border border-[var(--ar-gray-200)] bg-[var(--ar-gray-50)] p-4 text-center"
        >
          <Icon className="h-6 w-6 text-[var(--color-orange)]" aria-hidden />
          <span className="mt-2 text-2xl font-bold text-[var(--ar-gray-900)]">
            {stats[key].toLocaleString("sr-RS")}
          </span>
          <span className="text-sm font-medium text-[var(--ar-gray-600)]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
