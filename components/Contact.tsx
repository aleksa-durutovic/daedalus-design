"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import { CONTACT_EMAIL, socialLinks } from "@/content/social";

interface ContactProps {
  dict: Dictionary;
  /** Preview mode (holo windows/overlay): no id so anchors stay unique. */
  mini?: boolean;
}

/** Inline social icons keyed by SocialLink.icon (markup, not data). */
const SOCIAL_ICONS: Record<string, React.ReactElement> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M4.98 3.5A2.49 2.49 0 1 1 5 8.48a2.49 2.49 0 0 1-.02-4.98zM3 9.75h4v10.5H3zM9.5 9.75h3.8v1.44h.05a4.17 4.17 0 0 1 3.75-2.06c4 0 4.75 2.63 4.75 6.06v5.06h-4v-4.49c0-1.07-.02-2.45-1.5-2.45-1.5 0-1.73 1.17-1.73 2.38v4.56h-4z" />
    </svg>
  ),
  behance: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M8.2 6.5c.9 0 1.7.08 2.35.25.66.16 1.2.42 1.63.76.43.35.75.79.96 1.32.2.53.3 1.16.3 1.9 0 .82-.18 1.5-.55 2.05-.37.55-.92 1-1.65 1.35.99.29 1.73.79 2.22 1.5.49.72.73 1.58.73 2.6 0 .82-.16 1.53-.47 2.13a4.1 4.1 0 0 1-1.26 1.47c-.53.38-1.13.66-1.82.84-.68.18-1.4.27-2.13.27H1V6.5h7.2zm-.43 5.72c.73 0 1.33-.17 1.8-.52.47-.34.7-.9.7-1.68 0-.43-.08-.79-.23-1.06a1.74 1.74 0 0 0-.62-.65 2.6 2.6 0 0 0-.9-.33 5.5 5.5 0 0 0-1.06-.1H4.1v4.34h3.67zm.2 6.02c.4 0 .78-.04 1.14-.12.36-.08.68-.21.95-.4.27-.18.49-.43.65-.75.16-.32.24-.73.24-1.22 0-.97-.27-1.66-.82-2.08-.55-.41-1.27-.62-2.17-.62H4.1v5.19h3.87zM16.06 8.02h5.87v1.43h-5.87zM23 15.6c0 .1-.01.2-.02.3h-6.85c0 .75.26 1.46.7 1.87.44.4 1.08.6 1.9.6.6 0 1.11-.15 1.54-.44.43-.3.7-.61.79-.94h2.4c-.38 1.19-.97 2.04-1.76 2.55-.79.51-1.75.77-2.87.77-.78 0-1.49-.13-2.12-.38a4.4 4.4 0 0 1-1.6-1.06 4.7 4.7 0 0 1-1.03-1.65 6.13 6.13 0 0 1-.36-2.15c0-.75.12-1.46.37-2.11a4.9 4.9 0 0 1 1.05-1.67c.46-.47.99-.84 1.61-1.11a5.15 5.15 0 0 1 2.08-.41c.85 0 1.59.16 2.23.5.64.32 1.16.77 1.57 1.32.41.56.7 1.19.89 1.9.13.5.2 1.02.2 1.57.02.18.02.36 0 .54zm-2.72-1.3c-.04-.7-.25-1.22-.63-1.6-.38-.37-.92-.56-1.55-.56-.42 0-.77.07-1.05.21a2.1 2.1 0 0 0-.7.53 1.98 1.98 0 0 0-.38.67c-.08.24-.13.49-.14.75h4.45z" />
    </svg>
  ),
};

export default function Contact({ dict, mini }: ContactProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  function fallbackCopy(text: string): boolean {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  async function copyEmail() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      ok = true;
    } catch {
      ok = fallbackCopy(CONTACT_EMAIL);
    }
    if (!ok) return; // Copy unavailable — the email stays visible as selectable text.
    setCopied(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    // Root is a div: the full-screen snap <section> (shared with the footer)
    // lives in app/page.tsx.
    <div id={mini ? undefined : "contact"} className="m-auto w-full max-w-4xl px-6 pb-10 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
          <div className="rounded-3xl bg-surface px-6 py-12 text-center ring-1 ring-white/10 sm:px-12 md:py-16">
            <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-copper-soft">
              {t(dict, "contact.kicker")}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-night sm:text-4xl">
              {t(dict, "contact.title")}
            </h2>
            <p className="mt-4 text-night/60">{t(dict, "contact.sub")}</p>

            {/* Primary action block — structured so a <form> can replace it later
                without touching the surrounding section. */}
            <div className="mt-8 flex flex-col items-center gap-5">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <span className="select-all break-all font-display text-xl font-semibold text-night sm:text-2xl">
                  {CONTACT_EMAIL}
                </span>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={t(dict, "contact.copyAria")}
                  className="liquid-glass-dark cursor-pointer rounded-full px-5 py-2.5 font-display text-xs font-bold tracking-wide text-night focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper-soft"
                >
                  {copied ? t(dict, "contact.copied") : t(dict, "contact.copy")}
                </button>
              </div>

              {/* Screen-reader confirmation for the copy action */}
              <span aria-live="polite" className="sr-only">
                {copied ? t(dict, "contact.copied") : ""}
              </span>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm text-night/70 underline-offset-4 transition-colors hover:text-copper-soft hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper-soft"
              >
                {t(dict, "contact.mailto")}
              </a>
            </div>

            <div className="mt-10 border-t border-white/10 pt-6">
              <p className="mb-4 text-xs uppercase tracking-wider text-night/50">
                {t(dict, "contact.social")}
              </p>
              <ul className="flex items-center justify-center gap-4">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="liquid-glass-dark flex h-11 w-11 items-center justify-center rounded-full text-night/70 transition-colors hover:text-copper-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-soft"
                    >
                      {SOCIAL_ICONS[link.icon]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
      </motion.div>
    </div>
  );
}
