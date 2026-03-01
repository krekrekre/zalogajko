"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ProfilePreviewSectionProps {
  children: React.ReactNode;
}

export function ProfilePreviewSection({ children }: ProfilePreviewSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mt-8 border border-[color:color-mix(in_srgb,black_20%,transparent)] bg-[#ffffff] p-4 sm:p-6">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full cursor-pointer items-center gap-2 text-left text-lg font-semibold text-[var(--color-orange)] hover:underline"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="h-5 w-5 shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0" />
        )}
        Kako vas drugi vide
      </button>
      {expanded && <div className="mt-4">{children}</div>}
    </div>
  );
}
