# Daedalus Design

Marketing website for **Daedalus Design** — a studio that designs and builds websites.
Bilingual (Serbian default / English), single-page, fully offline-capable.

The visual world is built on the studio's namesake: Daedalus, the architect of the
labyrinth. A generated 3D maze forms the landing page, its corridors light up to
lead into each section, and a copper core marks the centre.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4 (CSS-first tokens in `app/globals.css`, mirrored in `design-tokens.json`)
- Framer Motion — scroll reveals, gate morphs, stat counters
- Self-hosted variable fonts (Sora + Inter, `public/fonts/`) — zero external requests

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Architecture notes

- **Scroll-snap sections.** Every section is a full-viewport snap target. Programmatic
  scrolling uses `behavior: "instant"` — mandatory snap swallows smooth scrolls.
- **Sections render twice.** Each section component takes a `mini` prop: once at full
  size, and once as a live miniature inside a hero gate window. Changes to a section
  must hold up at both scales.
- **Maze geometry is deterministic.** `lib/mazeGeometry.ts` generates the labyrinth
  from a fixed seed at module scope, so server and client markup match exactly.
- **Motion is gated.** `MotionConfig reducedMotion="user"` covers transform and layout
  animation; `clipPath`, `pathLength` and `strokeDashoffset` are not transforms and are
  gated by hand. Reduced-motion visitors get a quieter version of each interaction,
  never a missing one.

## i18n

- Default locale `sr`; switch via the SR/EN toggle in the nav.
- The locale lives in a `locale` cookie, read **server-side** (`lib/getLocale.ts`) —
  no client-side detection, no hydration mismatch.
- All copy lives in `content/i18n.ts`; the `en` object is typed against the `sr`
  key set, so a missing translation is a compile error.

## Accessibility

Text colour is verified by computed contrast, not by eye. All body text meets WCAG AA
(4.5:1) and large text meets 3:1, on both the dark page and the light demo panels.

Note that `--color-night` is **light cream** (`#ece9e1`) — a legacy alias kept for
backwards compatibility. Use `--color-abyss` for dark ink on light surfaces, and
`--color-copper-ink` for the copper accent on light surfaces (plain `copper` is tuned
for dark backgrounds and only reaches ~2.8:1 on white).
