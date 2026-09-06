import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prijava | Recepti",
};
// These pages read ?next= via useSearchParams in a client component. They are
// per-visitor and gain nothing from caching, so render them on demand rather
// than adding a Suspense bailout for a static shell nobody benefits from.
export const dynamic = "force-dynamic";


export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
