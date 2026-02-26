"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Heart,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NavCategory {
  id: string;
  slug: string;
  name_sr: string;
  type: string;
}

interface HeaderProps {
  categories: NavCategory[];
  ingredients: string[];
}

function Logo() {
  return (
    <Link
      href="/"
      className="site-logo group inline-flex items-center gap-1 cursor-pointer text-red-600"
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
  );
}

const navLinkBase =
  "whitespace-nowrap py-3 pr-6 text-[13px] font-semibold uppercase tracking-wide font-playpen-sans cursor-pointer transition-colors group";

const navLinkUnderline =
  "inline-block border-b border-transparent group-hover:border-[var(--color-orange)] transition-colors";

function HeaderUserBlock() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [accountOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 ml-2 h-9 w-20 bg-[var(--ar-gray-200)] rounded animate-pulse"
        aria-hidden
      />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 ml-2" ref={accountRef}>
        <Button
          asChild
          size="sm"
          className="rounded-none bg-[var(--color-orange)] hover:bg-[var(--ar-primary-hover)] text-white text-[13px] cursor-pointer"
        >
          <Link href="/recepti/novo">
            <PlusCircle className="w-4 h-4 mr-1" />
            Novi recept
          </Link>
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAccountOpen((o) => !o)}
            className="rounded-none text-[#2a2c41] text-[13px] font-normal cursor-pointer border border-[var(--color-orange)] focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-1"
            aria-expanded={accountOpen}
            aria-haspopup="true"
          >
            <User className="w-4 h-4 mr-1" />
            Nalog
            <ChevronDown
              className={`w-4 h-4 ml-0.5 transition-transform ${accountOpen ? "rotate-180" : ""}`}
            />
          </Button>
          {accountOpen && (
            <div
              className="absolute right-0 top-full pt-2 z-[100] min-w-[220px] border border-[var(--ar-gray-200)] bg-white py-2 shadow-xl rounded-md"
              role="menu"
            >
              <div className="px-4 py-2 border-b border-[var(--ar-gray-200)]">
                <span
                  className="text-[13px] text-[var(--color-primary)] truncate block max-w-[200px]"
                  title={user.email}
                >
                  {user.email ?? "Nalog"}
                </span>
              </div>
              <div className="px-1 pt-1">
                <Link
                  href="/moji-recepti"
                  onClick={() => setAccountOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] cursor-pointer rounded"
                  role="menuitem"
                >
                  <Heart className="w-4 h-4" />
                  Sačuvani recepti
                </Link>
                <Link
                  href="/moji-recepti/autorski"
                  onClick={() => setAccountOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] cursor-pointer rounded"
                  role="menuitem"
                >
                  <PlusCircle className="w-4 h-4" />
                  Moji recepti
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] cursor-pointer rounded"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Odjava
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 ml-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="rounded-none text-[#2a2c41] text-[13px] font-normal cursor-pointer"
      >
        <Link href="/login">
          <User className="w-4 h-4 mr-1" />
          Prijava
        </Link>
      </Button>
    </div>
  );
}

function NavDropdown({
  id,
  href,
  label,
  children,
  open,
  onOpen,
  onClose,
}: {
  id: string;
  href: string;
  label: string;
  children: React.ReactNode;
  open: boolean;
  onOpen: () => void;
  onClose: (id: string) => void;
}) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    onClose(id);
  };

  const handleEnter = () => {
    clearCloseTimer();
    onOpen();
  };

  return (
    <li
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={href}
        className={`flex items-center ${navLinkBase} ${
          open
            ? "text-[var(--color-orange)]"
            : "text-[var(--color-primary)] hover:text-[var(--color-orange)]"
        }`}
      >
        <span
          className={`${navLinkUnderline} ${open ? "!border-[var(--color-orange)]" : ""}`}
        >
          {label}
        </span>
      </Link>
      {open && (
        <ul
          className="absolute left-0 top-full pt-2 z-[100] min-w-[220px] max-h-[70vh] overflow-y-auto border border-[var(--ar-gray-200)] bg-white py-1 shadow-xl list-none m-0 p-0"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          {children}
        </ul>
      )}
    </li>
  );
}

export function Header({ categories, ingredients }: HeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOpenSection, setMobileOpenSection] = useState<
    "recepti" | "sastojci" | "kuhinja" | null
  >(null);

  const mealCategories = categories.filter((c) => c.type === "meal_type");
  const cuisineCategories = categories.filter((c) => c.type === "cuisine");

  const closeDropdown = (id: string) => {
    setOpenDropdown((current) => (current === id ? null : current));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileOpenSection(null);
  };

  const toggleMobileSection = (section: "recepti" | "sastojci" | "kuhinja") => {
    setMobileOpenSection((current) => (current === section ? null : section));
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-white">
      {/* Top section: Logo, Search, User actions */}
      <div>
        <div className="mx-auto max-w-[1284px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 pt-4 pb-3 sm:pt-8">
            <Logo />

            <div className="mx-4 hidden max-w-xl flex-1 md:block">
              <form action="/recepti" method="GET" className="relative">
                <Input
                  type="search"
                  name="sastojak"
                  placeholder="Pronađite recept ili sastojak"
                  className="h-10 w-full rounded-none border border-gray-300 bg-white pl-4 pr-24 text-[14px] selection:bg-[var(--color-orange)] selection:text-[var(--color-primary)] focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/25 outline-none"
                />
                <Button
                  type="submit"
                  className="absolute right-0 top-0 h-10 cursor-pointer rounded-none bg-[var(--color-orange)] hover:bg-[var(--ar-primary-hover)] px-4"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            <div className="hidden items-center gap-4 text-[13px] md:flex">
              <Link
                href="/moji-recepti"
                className="flex items-center gap-1 text-[var(--color-orange)] font-semibold hover:text-[var(--ar-primary-hover)] cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-[var(--color-orange)]" />
                <span className="text-[13px]">Sačuvani</span>
              </Link>
              <HeaderUserBlock />
            </div>

            <button
              type="button"
              onClick={() => {
                if (mobileMenuOpen) {
                  closeMobileMenu();
                } else {
                  setMobileMenuOpen(true);
                }
              }}
              className="inline-flex items-center justify-center rounded-md p-2 text-[var(--color-primary)] md:hidden"
              aria-label={mobileMenuOpen ? "Zatvori meni" : "Otvori meni"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-main-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-main-menu"
          className="fixed inset-0 z-[300] overflow-y-auto bg-[#efefef] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Glavni meni"
        >
          <div className="border-b border-[var(--ar-gray-300)] bg-[#efefef] px-3 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeMobileMenu}
                className="inline-flex h-9 w-9 items-center justify-center text-[var(--ar-gray-700)]"
                aria-label="Zatvori meni"
              >
                <X className="h-6 w-6" />
              </button>
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="inline-flex items-center gap-1 text-red-600"
              >
                <span className="text-[38px] font-semibold leading-none tracking-tight">
                  Zalogajko
                </span>
                <span
                  className="-mt-1 inline-block text-[30px] leading-none -rotate-[30deg]"
                  aria-hidden
                >
                  🍲
                </span>
              </Link>
            </div>
          </div>

          <div className="px-3 py-5">
            <p className="mb-2 text-[30px] font-semibold text-[var(--ar-gray-900)]">
              Search
            </p>
            <form action="/recepti" method="GET" className="relative">
              <Input
                type="search"
                name="sastojak"
                placeholder="Pronađite recept ili sastojak"
                className="h-12 w-full rounded-none border border-[var(--ar-gray-500)] bg-white pl-4 pr-14 text-base selection:bg-[var(--color-orange)] selection:text-[var(--color-primary)] focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/25 outline-none"
              />
              <Button
                type="submit"
                className="absolute right-0 top-0 h-12 w-12 cursor-pointer rounded-none bg-[var(--color-orange)] p-0 hover:bg-[var(--ar-primary-hover)]"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>

            <ul className="mt-6">
              <li className="border-b border-[var(--ar-gray-300)]">
                <button
                  type="button"
                  onClick={() => toggleMobileSection("recepti")}
                  aria-expanded={mobileOpenSection === "recepti"}
                  aria-controls="mobile-section-recepti"
                  className="flex items-center justify-between py-4 text-[22px] font-bold uppercase tracking-[0.08em] text-[var(--ar-gray-900)]"
                >
                  Recepti
                  <ChevronDown
                    className={`h-5 w-5 text-[var(--ar-gray-700)] transition-transform ${
                      mobileOpenSection === "recepti" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileOpenSection === "recepti" && (
                  <ul id="mobile-section-recepti" className="pb-3 pl-1">
                    {mealCategories.slice(0, 12).map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/recepti?kategorija=${c.slug}`}
                          onClick={closeMobileMenu}
                          className="block py-2 text-base text-[var(--ar-gray-700)]"
                        >
                          {c.name_sr}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/recepti"
                        onClick={closeMobileMenu}
                        className="block py-2 text-base font-semibold text-[var(--color-primary)]"
                      >
                        Pregledaj sve recepte
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li className="border-b border-[var(--ar-gray-300)]">
                <button
                  type="button"
                  onClick={() => toggleMobileSection("sastojci")}
                  aria-expanded={mobileOpenSection === "sastojci"}
                  aria-controls="mobile-section-sastojci"
                  className="flex items-center justify-between py-4 text-[22px] font-bold uppercase tracking-[0.08em] text-[var(--ar-gray-900)]"
                >
                  Sastojci
                  <ChevronDown
                    className={`h-5 w-5 text-[var(--ar-gray-700)] transition-transform ${
                      mobileOpenSection === "sastojci" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileOpenSection === "sastojci" && (
                  <ul id="mobile-section-sastojci" className="pb-3 pl-1">
                    {ingredients.length === 0 ? (
                      <li>
                        <span className="block py-2 text-base text-[var(--ar-gray-500)]">
                          Nema sastojaka.
                        </span>
                      </li>
                    ) : (
                      ingredients.slice(0, 12).map((name) => (
                        <li key={name}>
                          <Link
                            href={`/recepti?sastojak=${encodeURIComponent(name)}`}
                            onClick={closeMobileMenu}
                            className="block py-2 text-base text-[var(--ar-gray-700)]"
                          >
                            {name}
                          </Link>
                        </li>
                      ))
                    )}
                    <li>
                      <Link
                        href="/recepti"
                        onClick={closeMobileMenu}
                        className="block py-2 text-base font-semibold text-[var(--color-primary)]"
                      >
                        Pregledaj sve sastojke
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li className="border-b border-[var(--ar-gray-300)]">
                <button
                  type="button"
                  onClick={() => toggleMobileSection("kuhinja")}
                  aria-expanded={mobileOpenSection === "kuhinja"}
                  aria-controls="mobile-section-kuhinja"
                  className="flex items-center justify-between py-4 text-[22px] font-bold uppercase tracking-[0.08em] text-[var(--ar-gray-900)]"
                >
                  Kuhinja
                  <ChevronDown
                    className={`h-5 w-5 text-[var(--ar-gray-700)] transition-transform ${
                      mobileOpenSection === "kuhinja" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileOpenSection === "kuhinja" && (
                  <ul id="mobile-section-kuhinja" className="pb-3 pl-1">
                    {cuisineCategories.slice(0, 12).map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/recepti?kuhinja=${c.slug}`}
                          onClick={closeMobileMenu}
                          className="block py-2 text-base text-[var(--ar-gray-700)]"
                        >
                          {c.name_sr}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/recepti"
                        onClick={closeMobileMenu}
                        className="block py-2 text-base font-semibold text-[var(--color-primary)]"
                      >
                        Pregledaj sve kuhinje
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li className="border-b border-[var(--ar-gray-300)]">
                <Link
                  href="/saveti"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between py-4 text-[22px] font-bold uppercase tracking-[0.08em] text-[var(--ar-gray-900)]"
                >
                  Saveti
                  <ChevronRight className="h-5 w-5 text-[var(--ar-gray-700)]" />
                </Link>
              </li>
              <li className="border-b border-[var(--ar-gray-300)]">
                <Link
                  href="/blog"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between py-4 text-[22px] font-bold uppercase tracking-[0.08em] text-[var(--ar-gray-900)]"
                >
                  Blog
                  <ChevronRight className="h-5 w-5 text-[var(--ar-gray-700)]" />
                </Link>
              </li>
              <li className="border-b border-[var(--ar-gray-300)]">
                <Link
                  href="/o-nama"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between py-4 text-[22px] font-bold uppercase tracking-[0.08em] text-[var(--ar-gray-900)]"
                >
                  O nama
                  <ChevronRight className="h-5 w-5 text-[var(--ar-gray-700)]" />
                </Link>
              </li>
              <li className="border-b border-[var(--ar-gray-300)]">
                <Link
                  href="/moji-recepti"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between py-4 text-[22px] font-bold uppercase tracking-[0.08em] text-[var(--ar-gray-900)]"
                >
                  Sačuvani
                  <ChevronRight className="h-5 w-5 text-[var(--ar-gray-700)]" />
                </Link>
              </li>
              <li className="border-b border-[var(--ar-gray-300)]">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between py-4 text-[22px] font-bold uppercase tracking-[0.08em] text-[var(--ar-gray-900)]"
                >
                  Prijava
                  <ChevronRight className="h-5 w-5 text-[var(--ar-gray-700)]" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Main navigation - dropdowns (hover) */}
      <nav className="relative hidden md:block mb-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-[1284px] px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            <NavDropdown
              id="recepti"
              href="/recepti"
              label="Recepti"
              open={openDropdown === "recepti"}
              onOpen={() => setOpenDropdown("recepti")}
              onClose={closeDropdown}
            >
              {mealCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/recepti?kategorija=${c.slug}`}
                    className="block px-4 py-2.5 text-sm font-normal text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] hover:text-[var(--color-primary)] cursor-pointer"
                  >
                    {c.name_sr}
                  </Link>
                </li>
              ))}
              <li className="border-t border-[var(--ar-gray-200)] mt-1 pt-1">
                <Link
                  href="/recepti"
                  className="block px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] cursor-pointer"
                >
                  Pregledaj sve
                </Link>
              </li>
            </NavDropdown>

            <NavDropdown
              id="sastojci"
              href="/recepti"
              label="Sastojci"
              open={openDropdown === "sastojci"}
              onOpen={() => setOpenDropdown("sastojci")}
              onClose={closeDropdown}
            >
              {ingredients.length === 0 ? (
                <li>
                  <span className="block px-4 py-2 text-sm text-[var(--ar-gray-500)]">
                    Nema sastojaka
                  </span>
                </li>
              ) : (
                <>
                  {ingredients.slice(0, 7).map((name) => (
                    <li key={name}>
                      <Link
                        href={`/recepti?sastojak=${encodeURIComponent(name)}`}
                        className="block px-4 py-2.5 text-sm font-normal text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] hover:text-[var(--color-primary)] cursor-pointer"
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-[var(--ar-gray-200)] mt-1 pt-1">
                    <Link
                      href="/recepti"
                      className="block px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] cursor-pointer"
                    >
                      Pregledaj sve
                    </Link>
                  </li>
                </>
              )}
            </NavDropdown>

            <NavDropdown
              id="kuhinja"
              href="/recepti"
              label="Kuhinja"
              open={openDropdown === "kuhinja"}
              onOpen={() => setOpenDropdown("kuhinja")}
              onClose={closeDropdown}
            >
              {cuisineCategories.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/recepti?kuhinja=${c.slug}`}
                    className="block px-4 py-2.5 text-sm font-normal text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] hover:text-[var(--color-primary)] cursor-pointer"
                  >
                    {c.name_sr}
                  </Link>
                </li>
              ))}
              <li className="border-t border-[var(--ar-gray-200)] mt-1 pt-1">
                <Link
                  href="/recepti"
                  className="block px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--color-primary)] hover:bg-[var(--ar-gray-200)] cursor-pointer"
                >
                  Pregledaj sve
                </Link>
              </li>
            </NavDropdown>

            <li>
              <Link
                href="/saveti"
                className={`${navLinkBase} text-[var(--color-primary)] hover:text-[var(--color-orange)]`}
              >
                <span className={navLinkUnderline}>Saveti</span>
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className={`${navLinkBase} text-[var(--color-primary)] hover:text-[var(--color-orange)]`}
              >
                <span className={navLinkUnderline}>Blog</span>
              </Link>
            </li>
            <li>
              <Link
                href="/o-nama"
                className={`${navLinkBase} text-[var(--color-primary)] hover:text-[var(--color-orange)]`}
              >
                <span className={navLinkUnderline}>O nama</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
