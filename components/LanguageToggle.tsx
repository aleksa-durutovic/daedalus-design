"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary, Locale } from "@/types/content";
import { t } from "@/content/i18n";

interface LanguageToggleProps {
  dict: Dictionary;
  locale: Locale;
}

// Locale codes only (data, not copy); typed against Locale so drift is a compile error.
const OPTIONS: readonly Locale[] = ["sr", "en"];

export default function LanguageToggle({ dict, locale }: LanguageToggleProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function switchTo(next: Locale) {
    if (next === locale || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      if (res.ok) {
        // Cookie is the source of truth; re-render the server tree with it.
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center rounded-full border border-fg/10 bg-fg/5 p-1 text-xs font-semibold">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => switchTo(option)}
          disabled={pending}
          aria-pressed={locale === option}
          aria-label={t(dict, `toggle.label.${option}`)}
          className={`rounded-full px-2.5 py-1 font-display text-xs font-semibold tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan ${
            locale === option
              ? "bg-fg text-night shadow-sm"
              : "text-muted hover:text-fg"
          } ${pending ? "opacity-60" : ""}`}
        >
          {option.toUpperCase()}
        </button>
      ))}
      {/* Announces the language change to screen readers after the server
          re-render swaps the dictionary. */}
      <span aria-live="polite" className="sr-only">
        {t(dict, "toggle.announce")}
      </span>
    </div>
  );
}
