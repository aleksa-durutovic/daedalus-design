"use client";

import { useEffect } from "react";
import { closeTopOverlay, isOverlayOpen } from "@/lib/overlayState";

/**
 * HistoryGuard — makes the browser Back button behave like the site is one
 * place you move around IN, not a page you fall out of.
 *
 * Default behaviour was: the site is a single history entry, so the first
 * Back press left it entirely — even if the visitor had opened a dialog or
 * scrolled deep into a section. That is jarring on a scroll-snap landing
 * page whose whole job is to keep the visitor here long enough to email.
 *
 * The behaviour now, in priority order, on each Back press:
 *   1. An overlay is open  → close it, stay on the site.
 *   2. Scrolled past hero  → jump to the hero (the landing), stay on the site.
 *   3. Already at the hero → let Back leave the site normally.
 *
 * Mechanism: a single sentinel history entry ("guard"). While it is on top,
 * a Back press pops it and fires our handler, which decides what to undo and
 * re-arms the sentinel only when there is still something to trap. Re-armed
 * on scroll away from the hero so the guard is present whenever leaving would
 * otherwise be surprising, and absent at the hero so Back can exit in one
 * press. All history mutation is confined here.
 */

const HERO_THRESHOLD = 8; // px: below this we treat the view as "at the hero"

export default function HistoryGuard() {
  useEffect(() => {
    let armed = false;

    const arm = () => {
      if (armed) return;
      history.pushState({ daedalusGuard: true }, "");
      armed = true;
    };

    const toHero = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    const onPop = () => {
      // The sentinel was just consumed by this Back press.
      armed = false;

      // 1) Close the newest overlay, if any, and stay.
      if (isOverlayOpen()) {
        closeTopOverlay();
        arm();
        return;
      }

      // 2) Not at the hero → return to the landing, and stay. We do NOT
      //    re-arm here: the visitor is now at the hero, so the next Back
      //    should be free to leave. Scrolling away again re-arms via onScroll.
      if (window.scrollY > HERO_THRESHOLD) {
        toHero();
        return;
      }

      // 3) At the hero with nothing open → let Back leave. The sentinel is
      //    already gone, so this hands control back to the browser: if there
      //    is a prior page it navigates there, otherwise it is a no-op (the
      //    normal "can't go back past the first page" state).
      history.back();
    };

    const onScroll = () => {
      if (window.scrollY > HERO_THRESHOLD) arm();
    };

    // Seed the sentinel so the very first Back is caught, and cover the case
    // of loading already scrolled (refresh mid-page, deep link).
    arm();
    window.addEventListener("popstate", onPop);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
