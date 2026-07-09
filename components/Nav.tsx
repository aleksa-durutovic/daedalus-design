import type { Dictionary, Locale } from "@/types/content";
import { t } from "@/content/i18n";
import LanguageToggle from "@/components/LanguageToggle";

interface NavProps {
  dict: Dictionary;
  locale: Locale;
}

const ANCHOR_LINKS = [
  { href: "#services", key: "nav.services" },
  { href: "#portfolio", key: "nav.portfolio" },
  { href: "#about", key: "nav.about" },
] as const;

export default function Nav({ dict, locale }: NavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-night/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#top"
          className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
        >
          <span
            aria-hidden="true"
            className="bevel-sm flex h-8 w-8 items-center justify-center bg-gradient-to-br from-violet to-cyan font-display text-sm font-bold text-night"
          >
            B
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            Beverly<span className="text-gradient"> Design</span>
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {ANCHOR_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                >
                  {t(dict, link.key)}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            className="group relative hidden sm:inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
          >
            <span
              aria-hidden="true"
              className="bevel-sm absolute inset-0 bg-gradient-to-r from-violet-soft to-cyan transition-opacity group-hover:opacity-85"
            />
            <span className="relative z-10 block px-4 py-2 font-display text-xs font-bold tracking-wide text-night">
              {t(dict, "nav.contact")}
            </span>
          </a>

          <LanguageToggle dict={dict} locale={locale} />
        </div>
      </nav>
    </header>
  );
}
