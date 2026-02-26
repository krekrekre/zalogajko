"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) setStatus("denied");
        router.replace(`/login?next=${encodeURIComponent(pathname ?? "/admin")}`);
        return;
      }
      const res = await fetch("/api/admin-check");
      const data = await res.json();
      if (cancelled) return;
      if (data?.ok) {
        setStatus("allowed");
      } else {
        setStatus("denied");
        router.replace("/");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--ar-gray-600)]">Provera pristupa...</p>
      </div>
    );
  }

  if (status === "denied") {
    return null;
  }

  return <>{children}</>;
}
