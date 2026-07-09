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
    <div className="flex items-center border border-line bg-surface p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => switchTo(option)}
          disabled={pending}
          aria-pressed={locale === option}
          aria-label={t(dict, `toggle.label.${option}`)}
          className={`px-2.5 py-1 font-display text-xs font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan ${
            locale === option
              ? "bg-violet-soft text-night"
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
