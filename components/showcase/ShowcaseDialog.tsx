"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Dictionary, ShowcaseItem } from "@/types/content";
import { t } from "@/content/i18n";
import { Demo } from "@/components/showcase/demos";

/**
 * ShowcaseDialog — the window a showcase card opens into.
 *
 * Left: the demo, now LIVE (click products, pick slots, submit the form).
 * Right: who the site is for, what's included, how the work runs, how long
 * it takes, and the way to start one.
 *
 * A real dialog: role/aria-modal, focus trap, focus restore, scroll lock,
 * Esc to close. It registers in overlayState so Nav's global Esc handler
 * stands down while it is open (otherwise Esc would also jump to the hero).
 * The morph in/out is the same gate language as the hero: shared layoutId
 * plus an iris opening from the card.
 */

interface ShowcaseDialogProps {
  item: ShowcaseItem;
  dict: Dictionary;
  onClose: () => void;
  /** Jump to the contact section with this direction in mind. */
  onCta: () => void;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function ShowcaseDialog({ item, dict, onClose, onCta }: ShowcaseDialogProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descId = useId();
  const reduce = useReducedMotion() ?? false;

  // Focus restore. The scroll lock and the Esc claim are NOT owned here:
  // they hang off the caller's open-state, so they release the moment the
  // dialog is dismissed rather than whenever the exit animation happens to
  // finish (a frozen exit would otherwise leave the page unscrollable).
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Focus the close button rather than the demo, so a keyboard user lands
    // on the exit before wandering into a playground.
    closeRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  // Esc + focus trap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      // Visibility via client rects, NOT offsetParent: the panel is inside a
      // position:fixed layer, where offsetParent is null for every descendant
      // and would filter the whole dialog out of the trap.
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label={t(dict, "show.close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-abyss/85 backdrop-blur-sm"
        tabIndex={-1}
      />

      {/* No shared layoutId with the card: a layoutId present on both the
          open dialog and the still-mounted card leaves framer mid-morph and
          the exit animation never completes, so the dialog never unmounts.
          The iris below carries the gate language instead. */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0, transition: { duration: 0.18 } }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="holo-glass relative z-10 flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-none sm:h-auto sm:max-h-[86svh] sm:rounded-2xl"
      >
        {/* Title bar — matches the hero's gate windows */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[rgba(226,173,122,0.28)] px-4 py-3">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-copper-soft">
            {t(dict, item.tagKey)}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ✕
            </span>
            <span className="sr-only">{t(dict, "show.close")}</span>
          </button>
        </div>

        {/* Iris reveal of the contents, same easing as the hero gates.
            clipPath is not a transform, so Motion cannot strip it under
            reduced motion — gate it by hand and fade instead. */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "circle(12% at 50% 45%)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "circle(140% at 50% 45%)" }}
          transition={{ duration: reduce ? 0.25 : 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-[1.15fr_1fr]"
        >
          {/* The playable demo */}
          <div className="flex min-h-0 flex-col border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
            <div className="relative min-h-64 flex-1 overflow-hidden rounded-xl ring-1 ring-[rgba(226,173,122,0.25)] lg:min-h-[22rem]">
              <Demo demoKey={item.key} dict={dict} live />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-copper-soft/80">
              <span aria-hidden="true">☞</span>
              {t(dict, "portfolio.try")}
            </p>
          </div>

          {/* The written half */}
          <div className="min-w-0 space-y-5 p-5">
            <div>
              <h2 id={titleId} className="font-display text-2xl font-bold tracking-tight text-fg">
                {t(dict, item.titleKey)}
              </h2>
              <p id={descId} className="mt-2 text-sm leading-relaxed text-muted">
                {t(dict, item.descKey)}
              </p>
            </div>

            <Block label={t(dict, "show.for")}>
              <p className="text-sm leading-relaxed text-fg/85">{t(dict, item.forKey)}</p>
            </Block>

            <Block label={t(dict, "show.includes")}>
              <ul className="space-y-1.5">
                {item.featureKeys.map((k) => (
                  <li key={k} className="flex gap-2 text-sm leading-snug text-fg/85">
                    <span aria-hidden="true" className="mt-0.5 shrink-0 text-copper">
                      ✓
                    </span>
                    {t(dict, k)}
                  </li>
                ))}
              </ul>
            </Block>

            <Block label={t(dict, "show.process")}>
              <ol className="space-y-2">
                {item.stepKeys.map((k, i) => (
                  <li key={k} className="flex gap-2.5 text-sm leading-snug text-fg/85">
                    <span
                      aria-hidden="true"
                      className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-copper/20 font-display text-[10px] font-bold text-copper-soft"
                    >
                      {i + 1}
                    </span>
                    {t(dict, k)}
                  </li>
                ))}
              </ol>
            </Block>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {t(dict, "show.timeline")}
              </span>
              <span className="rounded-full border border-copper-soft/40 px-2.5 py-0.5 text-xs font-bold text-copper-soft">
                {t(dict, item.timelineKey)}
              </span>
              <button
                type="button"
                onClick={onCta}
                className="liquid-glass-button ml-auto rounded-full px-5 py-2.5 font-display text-sm font-semibold text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
              >
                {t(dict, "show.cta")} →
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-copper-deep">
        {label}
      </h3>
      {children}
    </section>
  );
}
