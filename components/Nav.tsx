"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

/** Inline stroke icons (markup, not data — keeps the site dependency-free). */
const ICONS = {
  arrowUpRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-6 w-6">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-6 w-6">
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
} as const;

/** Maze emblem cropped out of the full logo lock-up (wordmark rendered as text). */
function LogoMark({ size = "h-10 w-10" }: { size?: string }) {
  return (
    <span className={`${size} block shrink-0 overflow-hidden rounded-full`}>
      <img
        src="/logo.png"
        alt=""
        className="h-full w-full object-cover mix-blend-multiply"
        style={{ transform: "scale(1.65)", transformOrigin: "50% 38%" }}
      />
    </span>
  );
}

export default function Nav({ dict, locale }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl">
        <nav
          className={`flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 sm:px-5 ${
            scrolled ? "liquid-glass shadow-lg" : "liquid-glass-pill"
          }`}
        >
          {/* Logo — top left */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
          >
            <LogoMark />
            <span className="font-display text-base font-semibold tracking-tight text-fg">
              Daedalus<span className="text-gradient"> Design</span>
            </span>
          </a>

          {/* Desktop links — copper underline grows on hover */}
          <ul className="hidden items-center gap-8 md:flex">
            {ANCHOR_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="group relative py-1 text-sm font-medium text-fg/75 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                >
                  {t(dict, link.key)}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-copper transition-all duration-300 group-hover:w-full"
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* Actions: language toggle + liquid glass CTA */}
          <div className="hidden items-center gap-3 sm:flex">
            <LanguageToggle dict={dict} locale={locale} />
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="liquid-glass-button group flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 font-display text-xs font-semibold tracking-wide text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
            >
              <span>{t(dict, "hero.cta")}</span>
              <span className="text-copper transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                {ICONS.arrowUpRight}
              </span>
            </a>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageToggle dict={dict} locale={locale} />
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={t(dict, menuOpen ? "nav.menuClose" : "nav.menuOpen")}
              className="rounded-xl bg-fg/5 p-2 text-fg transition-colors hover:bg-fg/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            >
              {menuOpen ? ICONS.close : ICONS.menu}
            </button>
          </div>
        </nav>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="liquid-glass absolute inset-x-0 top-full z-50 mt-2 flex flex-col gap-4 rounded-2xl p-6 shadow-2xl sm:hidden"
            >
              <div className="flex flex-col gap-1">
                {ANCHOR_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="border-b border-fg/10 py-2.5 text-base font-semibold text-fg transition-colors hover:text-copper-deep"
                  >
                    {t(dict, link.key)}
                  </a>
                ))}
              </div>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="liquid-glass-button group mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-display text-sm font-bold text-fg"
              >
                <span>{t(dict, "hero.cta")}</span>
                <span className="text-copper">{ICONS.arrowUpRight}</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
