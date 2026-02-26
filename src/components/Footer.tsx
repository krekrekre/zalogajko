import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer
      className="border-t border-[var(--ar-gray-700)] bg-[var(--color-primary)]"
      style={{ color: 'var(--footer-text)' }}
    >
      <div className="mx-auto max-w-[1284px] px-8 py-12">
        <div className="grid gap-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-[var(--ar-primary)] hover:text-[var(--ar-primary-hover)]"
            >
              {SITE_NAME}
            </Link>
            <p className="mt-3 text-sm">
              Vodič kroz recepte za domaće kuvare. Pronađite, sačuvajte i delite
              omiljene recepte.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              Naš tim
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/o-nama"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  O nama
                </Link>
              </li>
              <li>
                <Link
                  href="/o-nama#test-kuhinja"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Test kuhinja
                </Link>
              </li>
              <li>
                <Link
                  href="/o-nama#autori"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Autori
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              Informacije
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/kontakt"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Kontakt
                </Link>
              </li>
              <li>
                <Link
                  href="/pravila"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Pravila korišćenja
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              Kategorije
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/kategorija/srpska"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Srpska kuhinja
                </Link>
              </li>
              <li>
                <Link
                  href="/kategorija/glavna-jela"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Glavna jela
                </Link>
              </li>
              <li>
                <Link
                  href="/kategorija/deserti"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Deserti
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              Korisnički nalog
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Prijavi se
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Registruj se
                </Link>
              </li>
              <li>
                <Link
                  href="/moji-recepti"
                  className="text-sm hover:text-[var(--ar-primary)]"
                >
                  Moji recepti
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--ar-gray-500)] pt-8 text-center text-sm">
          © {new Date().getFullYear()} {SITE_NAME}. Sva prava zadržana.
        </div>
      </div>
    </footer>
  );
}
