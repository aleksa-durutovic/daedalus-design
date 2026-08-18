/**
 * sections — the page's five full-screen panels, in order, and the ways to
 * move between them.
 *
 * They are the "pages" of this single-page site: the hero (landing) plus the
 * four content sections. SiteHistory records one browser history entry per
 * move between them, so Back walks back through the sections you visited and
 * the last in-site Back lands on the hero.
 *
 * Every section element carries its key as its id, so a key IS a scroll
 * target. Scrolling is always "instant": the document is snap-mandatory
 * (app/layout.tsx), which swallows smooth programmatic scrolls.
 */

export const SECTION_KEYS = ["hero", "services", "portfolio", "about", "contact"] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export function isSectionKey(v: unknown): v is SectionKey {
  return typeof v === "string" && (SECTION_KEYS as readonly string[]).includes(v);
}

/** Scroll a section to the top of the viewport. No-op if it isn't mounted. */
export function scrollToSection(key: SectionKey): void {
  document.getElementById(key)?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
}

/**
 * Navigation bridge. SiteHistory owns the history stack and registers a
 * recorder here; every explicit navigation (nav link, gate, CTA) calls
 * navigateToSection so the move is recorded deterministically as a history
 * entry — independent of scroll events, which some environments coalesce.
 * SiteHistory's scroll listener still records plain manual scrolling.
 */
let recorder: ((key: SectionKey) => void) | null = null;

export function setSectionRecorder(fn: ((key: SectionKey) => void) | null): void {
  recorder = fn;
}

export function navigateToSection(key: SectionKey): void {
  scrollToSection(key);
  recorder?.(key);
}
