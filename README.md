# Daedalus Design

Marketing website for **Daedalus Design** — a studio that designs and builds websites.
Bilingual (Serbian default / English), dark, single-page, fully offline-capable.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4 (CSS-first tokens in `app/globals.css`, mirrored in `design-tokens.json`)
- Framer Motion (scroll reveals, stat counters — respects `prefers-reduced-motion`)
- Self-hosted variable fonts (Sora + Inter, `public/fonts/`) — zero external requests

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## i18n

- Default locale `sr`; switch via the SR/EN toggle in the nav.
- The locale lives in a `locale` cookie, read **server-side** (`lib/getLocale.ts`) —
  no client-side detection, no hydration mismatch.
- All copy lives in `content/i18n.ts`; the `en` object is typed against the `sr`
  key set, so a missing translation is a compile error.

## Before launch (TODO)

- Replace the placeholder email/domain in `content/social.ts` (`CONTACT_EMAIL`).
- Replace placeholder social profile URLs in `content/social.ts`.
- Swap placeholder portfolio projects/copy with real work.
