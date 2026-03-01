"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const AUTH_PATHS = ["/login", "/signup"];

type AppShellProps = {
  children: React.ReactNode;
  categories: React.ComponentProps<typeof Header>["categories"];
  ingredients: React.ComponentProps<typeof Header>["ingredients"];
};

export function AppShell({ children, categories, ingredients }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname != null && AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <main className="min-h-screen flex-1 bg-white">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header categories={categories} ingredients={ingredients} />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </div>
  );
}
