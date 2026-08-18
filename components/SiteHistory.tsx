"use client";

import { useEffect } from "react";
import { closeTopOverlay, isOverlayOpen } from "@/lib/overlayState";
import { SECTION_KEYS, scrollToSection, setSectionRecorder, type SectionKey } from "@/lib/sections";

/**
 * SiteHistory — makes the browser Back button behave the way it does on a
 * normal multi-page site, even though this is one scrolling page.
 *
 * It treats each full-screen section as a page. As the visitor moves between
 * sections — by clicking a gate, a nav link or the CTA, OR by scrolling — it
 * records one history entry per section they land on. So Back steps back
 * through the sections in reverse, the last in-site Back lands on the hero
 * (the landing), and one more Back leaves the site.
 *
 * Overlays (the showcase dialog, a gate expansion mid-open) take priority:
 * a Back press closes the newest open overlay first and keeps your place,
 * instead of also moving you off the section.
 *
 * The current section is read from the DOM by hit-testing the viewport
 * centre — not an IntersectionObserver — because it must keep working while
 * scrolling programmatically and stay verifiable outside a live compositor.
 * A change pushes history unless our own programmatic scroll caused it (a
 * Back press, a nav click): those are masked by a short settle window so a
 * single move never records twice.
 */

const SETTLE_MS = 400; // mask the push a programmatic scroll would trigger
const DEBOUNCE_MS = 120; // let a snap settle before deciding the section

export default function SiteHistory() {
  useEffect(() => {
    let current: SectionKey = "hero";
    let suppressUntil = 0;
    let timer: number | undefined;

    const urlFor = (key: SectionKey) =>
      key === "hero" ? location.pathname + location.search : `#${key}`;

    const push = (key: SectionKey) => history.pushState({ sec: key }, "", urlFor(key));

    /** Which section owns the vertical centre of the viewport right now. */
    const sectionAtCentre = (): SectionKey => {
      const mid = window.innerHeight / 2;
      for (const key of SECTION_KEYS) {
        const el = document.getElementById(key);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) return key;
      }
      return current;
    };

    // Tag the entry we loaded on as the hero, so it is the floor of Back.
    const state = history.state as { sec?: SectionKey } | null;
    if (state?.sec) current = state.sec;
    else history.replaceState({ ...history.state, sec: "hero" }, "", urlFor("hero"));

    // Explicit navigations (nav link, gate, CTA) record deterministically.
    // We suppress the scroll-driven push their scroll would also cause, and
    // only add an entry when the section actually changes.
    const record = (key: SectionKey) => {
      suppressUntil = performance.now() + SETTLE_MS;
      if (key === current) return;
      current = key;
      push(key);
    };
    setSectionRecorder(record);

    // Fallback for plain manual scrolling (wheel/drag), where no navigate
    // call fires. Records the section the visitor comes to rest on.
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const now = sectionAtCentre();
        if (now === current) return;
        if (performance.now() < suppressUntil) {
          current = now;
          return;
        }
        current = now;
        push(now);
      }, DEBOUNCE_MS);
    };

    const onPop = (e: PopStateEvent) => {
      // 1) Close the newest overlay first, and keep the visitor in place.
      if (isOverlayOpen()) {
        closeTopOverlay();
        push(current); // re-arm the entry this Back consumed
        return;
      }
      // 2) Otherwise this Back is a section move: scroll to the section the
      //    entry we landed on records (defaulting to the hero), and suppress
      //    the push that scroll would otherwise trigger.
      const s = e.state as { sec?: SectionKey } | null;
      const target: SectionKey = s?.sec ?? "hero";
      suppressUntil = performance.now() + SETTLE_MS;
      current = target;
      scrollToSection(target);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      setSectionRecorder(null);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return null;
}
