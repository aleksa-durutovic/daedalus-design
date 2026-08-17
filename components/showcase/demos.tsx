"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary, ShowcaseKey } from "@/types/content";
import { t } from "@/content/i18n";

/* ==========================================================================
   Playable demos — one per kind of site the studio builds. Each is a small
   but WORKING vignette of the thing itself: a shop you can buy from, a
   booking flow you can complete, a company site you can navigate, a landing
   form you can submit. Nothing here is a grey skeleton bar.

   Two modes:
     live=false — the card / holo preview. Decorative: aria-hidden + inert,
                  shown in a representative resting state.
     live=true  — inside the open window. Fully interactive.

   All visible sample copy goes through the dictionary — an English visitor
   must not meet a Serbian mock shop.
   ========================================================================== */

export interface DemoProps {
  dict: Dictionary;
  /** Interactive (inside the open window) vs decorative (card preview). */
  live?: boolean;
}

const spring = { type: "spring" as const, stiffness: 320, damping: 26 };

/* ---------- shared bits ---------- */

function Chrome({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-abyss/10 bg-abyss/5 px-3 py-2">
      <span className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-abyss/20" />
        <span className="h-2 w-2 rounded-full bg-abyss/20" />
        <span className="h-2 w-2 rounded-full bg-copper/60" />
      </span>
      <span className="ml-1 truncate font-display text-[10px] font-semibold tracking-wide text-abyss/70">
        {label}
      </span>
    </div>
  );
}

function Success({
  dict,
  title,
  body,
  onReset,
  dark,
}: {
  dict: Dictionary;
  title: string;
  body: string;
  onReset: () => void;
  dark?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 text-center backdrop-blur-sm ${
        dark ? "bg-abyss/95" : "bg-white/95"
      }`}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-copper text-2xl text-white"
      >
        ✓
      </motion.div>
      <p className={`font-display text-sm font-bold ${dark ? "text-fg" : ""}`}>{title}</p>
      <p className={`max-w-[17rem] text-[11px] leading-snug ${dark ? "text-muted" : "text-abyss/70"}`}>
        {body}
      </p>
      <button
        type="button"
        onClick={onReset}
        className={`mt-1 rounded-full border px-4 py-1.5 text-[11px] font-semibold transition-colors ${
          dark ? "border-white/20 text-fg hover:bg-white/10" : "border-abyss/20 hover:bg-abyss/5"
        }`}
      >
        {t(dict, "demo.again")}
      </button>
    </motion.div>
  );
}

/** Product art without photography: layered copper/graphite gradients. */
const ART = {
  a: "linear-gradient(145deg,#e2ad7a 0%,#c08552 55%,#8a5a30 100%)",
  b: "linear-gradient(145deg,#3a4150 0%,#232833 60%,#141821 100%)",
  c: "linear-gradient(145deg,#d9c4a8 0%,#c08552 70%,#9a6a3c 100%)",
  d: "linear-gradient(145deg,#6f8f8d 0%,#3f5c5a 60%,#22312f 100%)",
};

/* ==========================================================================
   1. Shop — browse → open a product → add to cart → checkout
   ========================================================================== */

const PRODUCTS = [
  { id: 1, nameKey: "demo.shop.p1", price: 3400, art: ART.a },
  { id: 2, nameKey: "demo.shop.p2", price: 12900, art: ART.b },
  { id: 3, nameKey: "demo.shop.p3", price: 2650, art: ART.c },
  { id: 4, nameKey: "demo.shop.p4", price: 1890, art: ART.d },
];

const CAT_KEYS = ["demo.shop.cat.all", "demo.shop.cat.c1", "demo.shop.cat.c2", "demo.shop.cat.c3"];

export function DemoShop({ dict, live }: DemoProps) {
  const [open, setOpen] = useState<(typeof PRODUCTS)[number] | null>(null);
  const [cart, setCart] = useState<number[]>([]);
  const [placed, setPlaced] = useState(false);

  const money = (n: number) => `${n.toLocaleString("sr-RS")} ${t(dict, "demo.currency")}`;
  const total = cart.reduce((s, id) => s + (PRODUCTS.find((p) => p.id === id)?.price ?? 0), 0);

  return (
    // bg-night is the PAPER token (#ece9e1) — a light website surface. Ink on
    // it must therefore be `abyss`, never `night`.
    <div className="flex h-full flex-col overflow-hidden bg-night text-abyss">
      <Chrome label={t(dict, "demo.shop.url")} />

      {/* Toolbar: category pills + cart badge */}
      <div className="flex shrink-0 items-center gap-1.5 px-3 py-2">
        {CAT_KEYS.map((c, i) => (
          <span
            key={c}
            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
              i === 0 ? "bg-copper text-abyss" : "bg-abyss/8 text-abyss/70"
            }`}
          >
            {t(dict, c)}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1 rounded-full bg-abyss/8 px-2 py-0.5">
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-abyss/70" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3h2l1.5 7h7L14 5H5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6.5" cy="13" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
          </svg>
          <motion.span
            key={cart.length}
            initial={live ? { scale: 1.6 } : false}
            animate={{ scale: 1 }}
            className="text-[10px] font-bold tabular-nums text-abyss"
          >
            {cart.length}
          </motion.span>
        </span>
      </div>

      {/* Product grid */}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto px-3 pb-3 sm:grid-cols-4">
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            tabIndex={live ? 0 : -1}
            onClick={() => live && setOpen(p)}
            className={`flex min-h-0 flex-col rounded-lg bg-white p-1.5 text-left shadow-sm ring-1 ring-abyss/8 transition-all ${
              live ? "hover:shadow-lg hover:ring-copper/50 motion-safe:hover:-translate-y-1" : ""
            }`}
          >
            <div className="min-h-12 flex-1 rounded-md" style={{ background: p.art }} />
            <span className="mt-1.5 truncate text-[10px] font-semibold leading-tight">
              {t(dict, p.nameKey)}
            </span>
            <span className="mt-0.5 text-[10px] font-bold text-copper-ink">{money(p.price)}</span>
          </button>
        ))}
      </div>

      {/* Product detail sheet. Opacity rides along with every slide so that
          when Motion strips the transform under reduced motion, the panel
          still fades in rather than snapping into place — same for the
          checkout bar below. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={spring}
            className="absolute inset-x-0 bottom-0 z-10 rounded-t-2xl bg-white p-4 shadow-2xl ring-1 ring-abyss/10"
          >
            <div className="flex gap-3">
              <div className="h-20 w-20 shrink-0 rounded-lg" style={{ background: open.art }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{t(dict, open.nameKey)}</p>
                <p className="mt-0.5 text-sm font-bold text-copper-ink">{money(open.price)}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-abyss/70">
                  {t(dict, "demo.shop.blurb")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="h-6 w-6 shrink-0 rounded-full text-abyss/70 transition-colors hover:bg-abyss/8 hover:text-abyss"
                aria-label={t(dict, "show.close")}
              >
                ✕
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setCart((c) => [...c, open.id]);
                setOpen(null);
              }}
              className="mt-3 w-full rounded-full bg-copper px-4 py-2 text-xs font-bold text-abyss transition-colors hover:bg-copper-deep"
            >
              {t(dict, "demo.shop.add")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout bar */}
      <AnimatePresence>
        {cart.length > 0 && !placed && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={spring}
            className="flex shrink-0 items-center gap-3 border-t border-abyss/10 bg-abyss/5 px-3 py-2"
          >
            <span className="text-[11px] font-semibold text-abyss/70">{t(dict, "demo.shop.total")}</span>
            <span className="text-xs font-bold tabular-nums">{money(total)}</span>
            <button
              type="button"
              onClick={() => setPlaced(true)}
              className="ml-auto rounded-full bg-abyss px-4 py-1.5 text-[11px] font-bold text-white transition-transform motion-safe:hover:scale-105"
            >
              {t(dict, "demo.shop.order")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {placed && (
          <Success
            dict={dict}
            title={t(dict, "demo.shop.okTitle")}
            body={t(dict, "demo.shop.okBody")}
            onReset={() => {
              setPlaced(false);
              setCart([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   2. Service site — pick a service → pick a slot → confirm
   ========================================================================== */

const SERVICES = [
  { nameKey: "demo.book.s1", durKey: "demo.book.s1dur", price: 1800 },
  { nameKey: "demo.book.s2", durKey: "demo.book.s2dur", price: 4500 },
  { nameKey: "demo.book.s3", durKey: "demo.book.s3dur", price: 2200 },
];
const DAY_KEYS = ["demo.book.d1", "demo.book.d2", "demo.book.d3", "demo.book.d4"];
const SLOTS = ["09:00", "10:30", "12:00", "14:30", "16:00", "17:30"];
const TAKEN = new Set(["09:00", "14:30"]);

export function DemoBooking({ dict, live }: DemoProps) {
  const [svc, setSvc] = useState(0);
  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const money = (n: number) => `${n.toLocaleString("sr-RS")} ${t(dict, "demo.currency")}`;

  return (
    // bg-night is the PAPER token (#ece9e1) — a light website surface. Ink on
    // it must therefore be `abyss`, never `night`.
    <div className="flex h-full flex-col overflow-hidden bg-night text-abyss">
      <Chrome label={t(dict, "demo.book.url")} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 sm:grid-cols-2">
        {/* Service picker (doubles as the price list) */}
        <div>
          <p className="mb-1.5 font-display text-[9px] font-bold uppercase tracking-[0.18em] text-abyss/70">
            {t(dict, "demo.book.service")}
          </p>
          <div className="space-y-1.5">
            {SERVICES.map((s, i) => (
              <button
                key={s.nameKey}
                type="button"
                tabIndex={live ? 0 : -1}
                onClick={() => live && setSvc(i)}
                className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                  svc === i ? "border-copper bg-copper/10" : "border-abyss/10 bg-white hover:border-copper/40"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                    svc === i ? "border-copper" : "border-abyss/20"
                  }`}
                >
                  {svc === i && <span className="h-1.5 w-1.5 rounded-full bg-copper" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold leading-tight">
                    {t(dict, s.nameKey)}
                  </span>
                  <span className="text-[9px] text-abyss/70">{t(dict, s.durKey)}</span>
                </span>
                <span className="shrink-0 text-[10px] font-bold text-copper-ink">{money(s.price)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Day + slot picker */}
        <div>
          <p className="mb-1.5 font-display text-[9px] font-bold uppercase tracking-[0.18em] text-abyss/70">
            {t(dict, "demo.book.when")}
          </p>
          <div className="flex gap-1">
            {DAY_KEYS.map((d, i) => (
              <button
                key={d}
                type="button"
                tabIndex={live ? 0 : -1}
                onClick={() => live && setDay(i)}
                className={`flex-1 rounded-md px-1 py-1.5 text-[9px] font-semibold transition-colors ${
                  day === i ? "bg-abyss text-white" : "bg-abyss/6 text-abyss/70 hover:bg-abyss/12"
                }`}
              >
                {t(dict, d)}
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {SLOTS.map((s) => {
              const taken = TAKEN.has(s) && day === 1;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={taken}
                  tabIndex={live && !taken ? 0 : -1}
                  onClick={() => live && setSlot(s)}
                  className={`rounded-md py-1.5 text-[10px] font-bold tabular-nums transition-all ${
                    taken
                      ? "cursor-not-allowed bg-abyss/5 text-abyss/65 line-through"
                      : slot === s
                        ? "bg-copper text-abyss shadow-md"
                        : "bg-white text-abyss/70 ring-1 ring-abyss/10 hover:ring-copper/50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!slot}
            onClick={() => setDone(true)}
            className={`mt-2.5 w-full rounded-full py-2 text-[11px] font-bold transition-all ${
              slot ? "bg-copper text-abyss hover:bg-copper-deep" : "cursor-not-allowed bg-abyss/8 text-abyss/75"
            }`}
          >
            {slot ? `${t(dict, "demo.book.confirm")} ${t(dict, DAY_KEYS[day])} · ${slot}` : t(dict, "demo.book.pick")}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <Success
            dict={dict}
            title={t(dict, "demo.book.okTitle")}
            body={`${t(dict, SERVICES[svc].nameKey)} — ${t(dict, DAY_KEYS[day])}, ${slot}. ${t(dict, "demo.book.okBody")}`}
            onReset={() => {
              setDone(false);
              setSlot(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   3. Company site — navigate the site, read references
   ========================================================================== */

const TAB_KEYS = ["demo.co.tab1", "demo.co.tab2", "demo.co.tab3"];
const REFS = [
  { quoteKey: "demo.co.q1", whoKey: "demo.co.w1" },
  { quoteKey: "demo.co.q2", whoKey: "demo.co.w2" },
];
const TEAM = [
  { art: ART.b, nameKey: "demo.co.t1", roleKey: "demo.co.t1r", bioKey: "demo.co.t1b" },
  { art: ART.a, nameKey: "demo.co.t2", roleKey: "demo.co.t2r", bioKey: "demo.co.t2b" },
  { art: ART.d, nameKey: "demo.co.t3", roleKey: "demo.co.t3r", bioKey: "demo.co.t3b" },
];
const CERTS = ["demo.co.c1", "demo.co.c2", "demo.co.c3", "demo.co.c4"];
const PROJECTS = [
  { art: ART.a, nameKey: "demo.co.p1", metaKey: "demo.co.p1m" },
  { art: ART.b, nameKey: "demo.co.p2", metaKey: "demo.co.p2m" },
  { art: ART.c, nameKey: "demo.co.p3", metaKey: "demo.co.p3m" },
  { art: ART.d, nameKey: "demo.co.p4", metaKey: "demo.co.p4m" },
];

/** Service icons — thin line marks, the register a construction firm uses. */
const SVC_ICONS: Record<string, React.ReactElement> = {
  home: (
    <path d="M3 9.5 10 4l7 5.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z M8 18v-5h4v5" />
  ),
  office: <path d="M4 17V3h8v14 M12 8h4v9 M6.5 6h3 M6.5 9.5h3 M6.5 13h3" />,
  reno: <path d="M3 17h14 M5 14V8l5-4 5 4v6 M8.5 14v-3h3v3" />,
};

const SERVICES_CO = [
  { icon: "home", titleKey: "demo.co.sv1", descKey: "demo.co.sv1d" },
  { icon: "office", titleKey: "demo.co.sv2", descKey: "demo.co.sv2d" },
  { icon: "reno", titleKey: "demo.co.sv3", descKey: "demo.co.sv3d" },
];

/** Faint blueprint ruling — the texture behind the hero band. */
const BLUEPRINT =
  "repeating-linear-gradient(0deg,rgba(226,173,122,0.09) 0 1px,transparent 1px 22px)," +
  "repeating-linear-gradient(90deg,rgba(226,173,122,0.09) 0 1px,transparent 1px 22px)";

export function DemoCompany({ dict, live }: DemoProps) {
  const [tab, setTab] = useState(0);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white text-abyss">
      {/* Site header: logo mark, wordmark, nav, quote button */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-abyss/10 px-3 py-2">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded font-display text-[10px] font-bold text-white"
          style={{ background: "linear-gradient(145deg,#c08552,#8a5320)" }}
        >
          {t(dict, "demo.co.mark")}
        </span>
        <span className="font-display text-xs font-bold tracking-tight">{t(dict, "demo.co.name")}</span>
        <nav className="ml-auto flex gap-1">
          {TAB_KEYS.map((label, i) => (
            <button
              key={label}
              type="button"
              tabIndex={live ? 0 : -1}
              onClick={() => live && setTab(i)}
              className="relative px-2 py-1 text-[10px] font-semibold transition-colors"
            >
              <span className={tab === i ? "text-abyss" : "text-abyss/70"}>{t(dict, label)}</span>
              {tab === i && (
                <motion.span
                  layoutId={live ? "company-underline-live" : "company-underline"}
                  className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-copper"
                />
              )}
            </button>
          ))}
        </nav>
        <span className="ml-1 hidden shrink-0 rounded-full bg-abyss px-2.5 py-1 text-[9px] font-bold text-white sm:inline-block">
          {t(dict, "demo.co.quote")}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Keyed remount rather than AnimatePresence mode="wait": the new
            page appears at once and animates in, instead of waiting on the
            outgoing one's exit to finish. */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {tab === 0 && (
            <div>
              {/* Hero band — dark, blueprint-ruled, with real CTAs that
                  navigate the demo site rather than sitting there dead. */}
              <div className="relative overflow-hidden px-4 py-5" style={{ background: "linear-gradient(150deg,#232833,#10141b)" }}>
                <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: BLUEPRINT }} />
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-10 h-32 w-32 rounded-full"
                  style={{ background: "radial-gradient(circle,rgba(192,133,82,0.35),transparent 70%)" }}
                />
                <div className="relative">
                  <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-copper-soft">
                    {t(dict, "demo.co.eyebrow")}
                  </p>
                  <p className="mt-1.5 max-w-[22rem] font-display text-lg font-bold leading-tight text-fg">
                    {t(dict, "demo.co.head")}
                  </p>
                  <p className="mt-1.5 max-w-[26rem] text-[11px] leading-relaxed text-muted">
                    {t(dict, "demo.co.body")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      tabIndex={live ? 0 : -1}
                      onClick={() => live && setTab(1)}
                      className="rounded-full bg-copper px-3.5 py-1.5 text-[10px] font-bold text-abyss transition-colors hover:bg-copper-deep"
                    >
                      {t(dict, "demo.co.cta1")}
                    </button>
                    <button
                      type="button"
                      tabIndex={live ? 0 : -1}
                      onClick={() => live && setTab(2)}
                      className="rounded-full border border-white/25 px-3.5 py-1.5 text-[10px] font-bold text-fg transition-colors hover:bg-white/10"
                    >
                      {t(dict, "demo.co.cta2")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats strip straddling the hero edge */}
              <div className="grid grid-cols-3 divide-x divide-abyss/10 border-b border-abyss/10">
                {[
                  ["140+", "demo.co.m1"],
                  ["15", "demo.co.m2"],
                  ["25", "demo.co.m3"],
                ].map(([n, l]) => (
                  <div key={l} className="px-2 py-2.5 text-center">
                    <p className="font-display text-base font-bold leading-none text-copper-ink">{n}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-wide text-abyss/70">{t(dict, l)}</p>
                  </div>
                ))}
              </div>

              {/* Services */}
              <div className="p-4">
                <p className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-abyss/70">
                  {t(dict, "demo.co.svcTitle")}
                </p>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {SERVICES_CO.map((s) => (
                    <div
                      key={s.titleKey}
                      className="rounded-lg border border-abyss/10 bg-abyss/[0.03] p-2.5 transition-colors hover:border-copper/50"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-5 w-5 text-copper-ink"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {SVC_ICONS[s.icon]}
                      </svg>
                      <p className="mt-1.5 text-[11px] font-bold leading-tight">{t(dict, s.titleKey)}</p>
                      <p className="mt-0.5 text-[9px] leading-snug text-abyss/70">{t(dict, s.descKey)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="p-4">
              <p className="font-display text-sm font-bold leading-tight">{t(dict, "demo.co.refTitle")}</p>
              {/* Project gallery — captioned tiles, the way a builder shows work */}
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {PROJECTS.map((p) => (
                  <figure
                    key={p.nameKey}
                    className="group/p relative overflow-hidden rounded-lg ring-1 ring-abyss/10"
                  >
                    <div className="h-20 w-full" style={{ background: p.art }} />
                    <figcaption
                      className="absolute inset-x-0 bottom-0 px-2 py-1.5"
                      style={{ background: "linear-gradient(to top,rgba(16,20,27,0.92),rgba(16,20,27,0.55) 60%,transparent)" }}
                    >
                      <p className="truncate text-[10px] font-bold text-fg">{t(dict, p.nameKey)}</p>
                      <p className="truncate text-[9px] text-copper-soft">{t(dict, p.metaKey)}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>

              {/* Testimonials under the work */}
              <div className="mt-3 space-y-2">
                {REFS.map((r) => (
                  <figure key={r.whoKey} className="rounded-lg border-l-2 border-copper bg-abyss/[0.04] p-2.5">
                    <blockquote className="text-[11px] font-medium italic leading-snug">
                      {t(dict, r.quoteKey)}
                    </blockquote>
                    <figcaption className="mt-1.5 text-[9px] font-semibold text-abyss/70">
                      {t(dict, r.whoKey)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className="p-4">
              <p className="font-display text-sm font-bold leading-tight">{t(dict, "demo.co.teamTitle")}</p>
              <p className="mt-1 text-[10px] leading-snug text-abyss/70">{t(dict, "demo.co.teamSub")}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {TEAM.map((m) => (
                  <div
                    key={m.nameKey}
                    className="rounded-lg border border-abyss/10 p-2.5 text-center transition-colors hover:border-copper/50"
                  >
                    <div
                      className="mx-auto h-14 w-14 rounded-full ring-2 ring-white"
                      style={{ background: m.art, boxShadow: "0 2px 10px rgba(16,20,27,0.18)" }}
                    />
                    <p className="mt-2 text-[11px] font-bold leading-tight">{t(dict, m.nameKey)}</p>
                    <p className="text-[9px] uppercase tracking-wide text-copper-ink">{t(dict, m.roleKey)}</p>
                    <p className="mt-1.5 text-[9px] leading-snug text-abyss/70">{t(dict, m.bioKey)}</p>
                  </div>
                ))}
              </div>

              {/* Credentials — the trust badges a contractor leads with */}
              <div className="mt-3 rounded-lg bg-abyss/[0.03] p-2.5">
                <p className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-abyss/70">
                  {t(dict, "demo.co.certTitle")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CERTS.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full border border-abyss/15 bg-white px-2 py-0.5 text-[9px] font-semibold"
                    >
                      <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5 text-copper-ink" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M2.5 6.2 5 8.5l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t(dict, c)}
                    </span>
                  ))}
                </div>
              </div>
              {/* Hiring strip — the section every real firm site has */}
              <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-dashed border-copper/50 bg-copper/[0.07] p-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-copper text-[11px] font-bold text-abyss"
                >
                  +
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold leading-tight">{t(dict, "demo.co.hiring")}</p>
                  <p className="text-[9px] leading-snug text-abyss/70">{t(dict, "demo.co.hiringSub")}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Site footer */}
      <div className="flex shrink-0 items-center gap-2 border-t border-abyss/10 bg-abyss/[0.03] px-3 py-2">
        <span className="truncate text-[9px] font-semibold text-abyss/70">{t(dict, "demo.co.contact")}</span>
        <span className="ml-auto hidden shrink-0 text-[9px] text-abyss/70 sm:inline">
          {t(dict, "demo.co.rights")}
        </span>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. Landing — one message, one form, live validation, one action
   ========================================================================== */

export function DemoLanding({ dict, live }: DemoProps) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email);

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center overflow-hidden p-5 text-center"
      style={{ background: "linear-gradient(160deg,#1b1f27 0%,#10141b 70%)" }}
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(192,133,82,0.28),transparent 70%)" }}
      />

      {/* The success state overlays the form (like the other demos) instead
          of swapping with it — no exit animation to wait on. */}
      <div className="relative w-full max-w-xs">
            <span className="inline-block rounded-full border border-copper-soft/40 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-copper-soft">
              {t(dict, "demo.land.badge")}
            </span>
            <p className="mt-2.5 font-display text-lg font-bold leading-tight text-fg">
              {t(dict, "demo.land.head")}
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">{t(dict, "demo.land.sub")}</p>

            <div className="mt-3 flex gap-1.5">
              <input
                type="email"
                value={email}
                tabIndex={live ? 0 : -1}
                readOnly={!live}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={t(dict, "demo.land.ph")}
                aria-label={t(dict, "demo.land.label")}
                className={`min-w-0 flex-1 rounded-full border bg-white/8 px-3 py-2 text-[11px] text-fg outline-none transition-colors placeholder:text-muted/75 ${
                  touched && email && !valid
                    ? "border-red-400/70"
                    : valid
                      ? "border-copper"
                      : "border-white/15 focus:border-copper/60"
                }`}
              />
              <button
                type="button"
                disabled={!valid}
                onClick={() => setSent(true)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold transition-all ${
                  valid ? "bg-copper text-abyss hover:bg-copper-deep" : "cursor-not-allowed bg-white/10 text-muted"
                }`}
              >
                {t(dict, "demo.land.cta")}
              </button>
            </div>

            {/* Validation feedback in flight */}
            <div className="mt-1.5 h-3">
              {touched && email && !valid && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-medium text-red-400">
                  {t(dict, "demo.land.bad")}
                </motion.p>
              )}
              {valid && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-medium text-copper-soft">
                  {t(dict, "demo.land.good")}
                </motion.p>
              )}
            </div>

            <div className="mt-2 flex items-center justify-center gap-3 text-[9px] text-muted">
              <span>{t(dict, "demo.land.perf")}</span>
              <span>·</span>
              <span>{t(dict, "demo.land.goal")}</span>
            </div>
      </div>

      <AnimatePresence>
        {sent && (
          <Success
            dict={dict}
            dark
            title={t(dict, "demo.land.okTitle")}
            body={t(dict, "demo.land.okBody")}
            onReset={() => {
              setSent(false);
              setEmail("");
              setTouched(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   Registry
   ========================================================================== */

const DEMOS: Record<ShowcaseKey, (p: DemoProps) => React.ReactElement> = {
  shop: DemoShop,
  booking: DemoBooking,
  company: DemoCompany,
  landing: DemoLanding,
};

/**
 * Renders a demo. Decorative previews are inert and hidden from the
 * accessibility tree; only the copy inside the open window is reachable.
 * Remounted on live-mode change so a demo left mid-flow in a card preview
 * opens fresh in the window.
 */
export function Demo({ demoKey, dict, live }: { demoKey: ShowcaseKey; dict: Dictionary; live?: boolean }) {
  const Cmp = DEMOS[demoKey];
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden={live ? undefined : "true"} inert={!live}>
      <Cmp key={live ? "live" : "still"} dict={dict} live={live} />
    </div>
  );
}
