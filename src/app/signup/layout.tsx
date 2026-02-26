import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registracija | Recepti",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
