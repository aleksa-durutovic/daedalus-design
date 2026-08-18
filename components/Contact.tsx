"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import { CONTACT_EMAIL } from "@/content/social";

interface ContactProps {
  dict: Dictionary;
  /** Accepted for parity with the other sections (gate expansion passes it);
      Contact renders the same either way now that its id lives on the section. */
  mini?: boolean;
}

export default function Contact({ dict }: ContactProps) {
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
    <div className="m-auto w-full max-w-4xl px-6 pb-10 pt-24">
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
          </div>
      </motion.div>
    </div>
  );
}
