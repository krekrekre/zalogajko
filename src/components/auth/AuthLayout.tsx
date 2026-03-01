"use client";

import Image from "next/image";
import Link from "next/link";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: full viewport height image */}
      <div className="relative hidden min-h-[280px] overflow-hidden bg-[var(--ar-gray-200)] lg:block lg:min-h-screen">
        <Image
          src={AUTH_IMAGE}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
      </div>

      {/* Right: site name (like homepage) + nazad link + form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 pr-[20vw] lg:px-12 lg:py-16 lg:pr-[20vw]">
        <Link
          href="/"
          className="site-logo group mb-4 inline-flex items-center gap-1 cursor-pointer text-red-600"
          aria-label="Nazad na početnu"
        >
          <span className="text-[42px] font-semibold leading-none tracking-tight">
            Zalogajko
          </span>
          <span
            className="-mt-1 inline-block text-[42px] leading-none -rotate-[30deg]"
            aria-hidden
          >
            🍲
          </span>
        </Link>
        <Link href="/" className="auth-form-back mb-6">
          ← Nazad na početnu
        </Link>
        <div className="auth-form-card w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
