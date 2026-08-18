"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary, ShowcaseItem } from "@/types/content";
import { t } from "@/content/i18n";
import { showcase } from "@/content/portfolio";
import { pushOverlay } from "@/lib/overlayState";
import SectionBackdrop from "@/components/SectionBackdrop";
import { Demo } from "@/components/showcase/demos";
import ShowcaseDialog from "@/components/showcase/ShowcaseDialog";

interface PortfolioProps {
  dict: Dictionary;
  /** Preview mode (holo windows/overlay): no id, no snap, no backdrop. */
  mini?: boolean;
}

/**
 * Portfolio — the four kinds of site the studio builds. Each card previews
 * a real, working demo of that kind of site; clicking one opens it into a
 * dialog where the demo becomes playable and the written detail lives.
 *
 * In `mini` mode the whole section is rendered inside a hero gate window,
 * where it must stay display-only — the cards do not open anything there
 * (the gate itself is the click target).
 */
export default function Portfolio({ dict, mini }: PortfolioProps) {
  const [open, setOpen] = useState<ShowcaseItem | null>(null);

  // Scroll lock + Esc claim live with the OPEN STATE, not with the dialog's
  // mount: they must release the instant it is dismissed, even if the exit
  // animation is slow, interrupted, or frozen (a hidden tab stops rAF).
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    // Register the closer so a browser Back press (via HistoryGuard) closes
    // the dialog instead of leaving the site.
    const off = pushOverlay(() => setOpen(null));
    return () => {
      html.style.overflow = prev;
      off();
    };
  }, [open]);

  function goToContact() {
    setOpen(null);
    // Let the dialog's effect cleanup release the scroll lock, THEN jump.
    // Must be "instant": the page is snap-mandatory (app/layout.tsx), which
    // swallows smooth programmatic scrolls — the reason Nav and HoloDeck also
    // scroll instantly. With "smooth" the CTA appeared to do nothing.
    window.setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    }, 60);
  }

  return (
    <section
      id={mini ? undefined : "portfolio"}
      className={
        mini ? "relative h-full overflow-hidden" : "relative h-svh snap-start snap-always overflow-hidden"
      }
    >
      {!mini && <SectionBackdrop variant="rings" />}
      <div className="relative z-10 flex h-full flex-col overflow-y-auto">
        {/* min-h-0 + flex-1 grid: tiles stretch to exactly fill the viewport */}
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 pb-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-copper-deep">
              {t(dict, "portfolio.kicker")}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t(dict, "portfolio.title")}
            </h2>
            <p className="mt-3 text-muted">{t(dict, "portfolio.sub")}</p>
          </motion.div>

          <div className="mt-6 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3 lg:gap-4">
            {showcase.map((item, index) => {
              return (
                <motion.article
                  key={item.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.5,
                    delay: (index % 2) * 0.08 + Math.floor(index / 2) * 0.12,
                    ease: "easeOut",
                  }}
                  className="group flex min-h-28 flex-col overflow-hidden rounded-2xl bg-surface p-2.5 ring-1 ring-white/10 transition-all duration-300 hover:shadow-xl hover:ring-copper/50 focus-within:ring-copper"
                >
                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl">
                    <Demo demoKey={item.key} dict={dict} />
                    {/* Click affordance — the whole tile is the hit area */}
                    {!mini && (
                      <button
                        type="button"
                        onClick={() => setOpen(item)}
                        aria-label={`${t(dict, "portfolio.open")}: ${t(dict, item.titleKey)}`}
                        className="absolute inset-0 z-10 flex cursor-pointer items-end justify-center bg-gradient-to-t from-abyss/80 via-transparent to-transparent pb-3 opacity-0 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
                      >
                        <span className="rounded-full bg-copper px-4 py-1.5 font-display text-xs font-bold text-abyss shadow-lg">
                          {t(dict, "portfolio.open")} →
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="px-1.5 pb-1 pt-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-display text-sm font-semibold text-fg">
                        {t(dict, item.titleKey)}
                      </h3>
                      <span className="shrink-0 rounded-full border border-copper-soft/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-copper-soft">
                        {t(dict, item.tagKey)}
                      </span>
                    </div>
                    <p className="mt-1 hidden text-xs leading-snug text-muted sm:line-clamp-2">
                      {t(dict, item.descKey)}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* The promise under the grid: the direction is the client's call. */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-4 flex items-center gap-2 text-sm text-muted"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0 text-copper">
              <path
                d="M8 1.5A6.5 6.5 0 1 1 1.5 8M8 4.25A3.75 3.75 0 1 1 4.25 8M8 7v2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            {t(dict, "portfolio.note")}
          </motion.p>
        </div>
      </div>

      {!mini && (
        <AnimatePresence>
          {open && (
            <ShowcaseDialog
              key={open.key}
              item={open}
              dict={dict}
              onClose={() => setOpen(null)}
              onCta={goToContact}
            />
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
