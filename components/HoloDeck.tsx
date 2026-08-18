"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Contact from "@/components/Contact";
import SectionBackdrop from "@/components/SectionBackdrop";
import { MAZE_SIZE, corridorPath, ptN, wallsNear } from "@/lib/mazeGeometry";
import { useApertureCanvas } from "@/lib/mazeRaster";
import { DEPTH, usePointerParallax } from "@/lib/pointer";
import { navigateToSection } from "@/lib/sections";
import { pushOverlay } from "@/lib/overlayState";

/**
 * HoloDeck — four GATES of the labyrinth. Each window is a live, scaled-down
 * render of a real page section, framed by the actual maze walls of the
 * region it sits over (an aperture looking down a shaft). Lit corridors walk
 * the real maze geometry — ring arcs + radial runs — from the glowing core
 * out to each gate, with a copper pulse traveling the path. Windows and
 * corridors share one polar coordinate system (the maze's own 1440×1440
 * viewBox, slice-projected like MazeScene), so they can never detach.
 * Clicking a gate expands it fullscreen via a shared layoutId morph, then
 * hands off to the real section (the site "opens" at that page).
 */

interface HoloDeckProps {
  dict: Dictionary;
}

type PanelKey = "services" | "portfolio" | "about" | "contact";
type LayoutName = "ring" | "diagonal";

interface PanelBase {
  key: PanelKey;
  labelKey: string;
  variant: "corner" | "rings" | "arcs";
}

/** Polar placement in maze coordinates + window width (depth = size). */
interface Placement {
  angle: number; // degrees, 0 = east, clockwise (SVG y-down)
  r: number; // maze radius of the gate
  w: number; // window width in px (outer gates are nearer → bigger)
}

type PanelDef = PanelBase & Placement;

// Virtual canvas each live preview renders at before being scaled down.
const VW = 1280;
const VH = 800;
const PANEL_W_MOBILE = 150;
const FRAME_PAD = 10; // aperture frame visible around the preview
const TITLE_H = 27; // approx title bar height (border included)
const T0 = 0.15; // reveal theater start: corridors draw → gates pop → windows iris

const BASE: PanelBase[] = [
  { key: "services", labelKey: "nav.services", variant: "corner" },
  { key: "portfolio", labelKey: "nav.portfolio", variant: "rings" },
  { key: "about", labelKey: "nav.about", variant: "arcs" },
  { key: "contact", labelKey: "nav.contact", variant: "corner" },
];

/**
 * Two compositions (prototype toggle, bottom-right):
 *  ring     — a clockwise arc of gates around the core (10 → 12 → 1 → 3
 *             o'clock), bottom-left left free for the H1.
 *  diagonal — near/far depth diagonal from lower-right past the core to
 *             upper-left; sizes fall off with distance.
 */
const LAYOUTS: Record<LayoutName, Record<PanelKey, Placement>> = {
  ring: {
    services: { angle: 188, r: 480, w: 250 },
    portfolio: { angle: 230, r: 210, w: 200 },
    about: { angle: 310, r: 185, w: 205 },
    contact: { angle: 352, r: 470, w: 255 },
  },
  diagonal: {
    services: { angle: 200, r: 500, w: 185 },
    portfolio: { angle: 222, r: 220, w: 210 },
    about: { angle: 20, r: 340, w: 240 },
    contact: { angle: 38, r: 535, w: 275 },
  },
};

// Corridor paths are deterministic (seeded) → SSR-stable, built once.
const CORRIDORS: Record<LayoutName, Record<PanelKey, string>> = {
  ring: {
    services: corridorPath(188, 480, 0),
    portfolio: corridorPath(230, 210, 1),
    about: corridorPath(310, 185, 2),
    contact: corridorPath(352, 470, 3),
  },
  diagonal: {
    services: corridorPath(200, 500, 7),
    portfolio: corridorPath(222, 220, 8),
    about: corridorPath(20, 340, 9),
    contact: corridorPath(38, 535, 10),
  },
};

function panelHeight(w: number): number {
  return TITLE_H + FRAME_PAD * 2 + Math.round(((w - FRAME_PAD * 2) * VH) / VW);
}

function renderSection(key: PanelKey, dict: Dictionary) {
  switch (key) {
    case "services":
      return <Services dict={dict} mini />;
    case "portfolio":
      return <Portfolio dict={dict} mini />;
    case "about":
      return <About dict={dict} mini />;
    case "contact":
      // Contact's root uses m-auto — give it the flex column it centers in.
      return (
        <div className="flex h-full flex-col">
          <Contact dict={dict} mini />
        </div>
      );
  }
}

/**
 * GatePoster — a cheap static stand-in for the section behind a gate.
 *
 * The gates used to mount four COMPLETE live section trees, each scaled to
 * fit the window. At gate width that scale is 0.10–0.19, so a 16px heading
 * lands under 3px tall: the content was already illegible and read as
 * coloured blocks. Producing those blocks cost ~1,200 DOM nodes, four sets
 * of running Framer loops (Portfolio alone ran all four playable demos) and
 * a re-layout of every one of them on each parallax frame.
 *
 * These posters draw the same block rhythm in ~15 nodes each. The real,
 * fully live section is one click away in the overlay.
 */
const BAR = "rounded-full bg-fg/25";
const CARD = "rounded bg-surface ring-1 ring-white/10";

function GatePoster({ panel, width }: { panel: PanelBase; width: number }) {
  const height = Math.round((width * VH) / VW);
  return (
    <div
      aria-hidden="true"
      className="relative select-none overflow-hidden bg-abyss"
      style={{ width, height }}
    >
      {/* section kicker + title, common to every layout */}
      <div className="absolute inset-x-[7%] top-[9%]">
        <div className="h-[3%] w-[22%] rounded-full bg-copper" style={{ minHeight: 2 }} />
        <div className={`mt-[6%] h-[6%] w-[62%] ${BAR}`} style={{ minHeight: 3 }} />
      </div>

      {panel.key === "services" && (
        <div className="absolute inset-x-[7%] bottom-[10%] grid grid-cols-2 gap-[3%]" style={{ height: "52%" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex flex-col justify-end p-[6%] ${CARD}`}>
              <span className="mb-[8%] block h-[14%] w-[22%] rounded-sm bg-copper" style={{ minHeight: 2 }} />
              <span className={`block h-[10%] w-[70%] ${BAR}`} />
            </div>
          ))}
        </div>
      )}

      {panel.key === "portfolio" && (
        <div className="absolute inset-x-[7%] bottom-[10%] grid grid-cols-2 gap-[3%]" style={{ height: "58%" }}>
          {["#c08552", "#232833", "#d9c4a8", "#3f5c5a"].map((c, i) => (
            <div key={i} className={`overflow-hidden p-[4%] ${CARD}`}>
              <span className="block h-[72%] w-full rounded-sm" style={{ background: c }} />
              <span className={`mt-[8%] block h-[10%] w-[64%] ${BAR}`} />
            </div>
          ))}
        </div>
      )}

      {panel.key === "about" && (
        <div className="absolute inset-x-[7%] bottom-[12%]" style={{ height: "54%" }}>
          <div className="space-y-[4%]">
            {[92, 84, 70].map((w) => (
              <div key={w} className={`h-[7%] ${BAR}`} style={{ width: `${w}%`, minHeight: 2 }} />
            ))}
          </div>
          <div className="mt-[12%] grid grid-cols-4 gap-[4%]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <span className="block h-[3px] w-[80%] rounded-full bg-copper" />
                <span className={`mt-[30%] block h-[2px] w-full ${BAR}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {panel.key === "contact" && (
        <div className="absolute inset-x-[16%] bottom-[16%] flex flex-col items-center">
          <div className="h-[10px] w-[72%] rounded-full bg-surface ring-1 ring-white/10" />
          <div className="mt-[8%] h-[7px] w-[42%] rounded-full bg-copper" />
          <div className="mt-[10%] flex gap-[6%]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-[5px] w-[5px] rounded-full bg-fg/30" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Aperture — the maze region this gate sits over, rendered from the SAME
 * generated walls as MazeScene, centered on the gate and rotated so the
 * direction away from the core points up. Each window literally frames a
 * different part of the labyrinth.
 */
function Aperture({ angle, r, w, h }: { angle: number; r: number; w: number; h: number }) {
  const gate = useMemo(() => ptN(r, angle), [r, angle]);
  const walls = useMemo(() => wallsNear(r, 160), [r]);
  const rot = -90 - angle; // outward direction → up
  // Rasterised: this was 214 live <path> elements per gate, ×4 gates.
  const ref = useApertureCanvas(walls, gate, rot, w, h);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{ width: w, height: h }}
    />
  );
}

/** One gate window (role=button — real buttons can't nest the preview's interactive HTML). */
function HoloPanel({
  panel,
  dict,
  pos,
  width,
  floating,
  index,
  reduce,
  hovered,
  dimmed,
  drift,
  onOpen,
  onHover,
}: {
  panel: PanelDef;
  dict: Dictionary;
  pos: [number, number] | null; // gate position in screen px (floating only)
  width: number;
  floating: boolean;
  index: number;
  reduce: boolean;
  hovered: boolean;
  dimmed: boolean;
  drift: [number, number];
  onOpen: (p: PanelDef) => void;
  onHover: (k: PanelKey | null) => void;
}) {
  const previewW = width - FRAME_PAD * 2;
  const h = panelHeight(width);
  return (
    <motion.div
      layout
      layoutId={`holo-${panel.key}`}
      id={`holo-btn-${panel.key}`}
      role="button"
      tabIndex={0}
      aria-label={`${t(dict, "holo.open")}: ${t(dict, panel.labelKey)}`}
      onClick={() => onOpen(panel)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(panel);
        }
      }}
      onMouseEnter={() => onHover(panel.key)}
      onMouseLeave={() => onHover(null)}
      className={`holo-glass group cursor-pointer overflow-hidden rounded-xl pointer-events-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${
        floating ? "absolute" : ""
      }`}
      // Position lives in `style`: layoutId owns the transform, so left/top
      // changes (layout toggle, resize) animate via layout projection —
      // putting them in `animate` would fight it and freeze the panel.
      style={
        floating && pos
          ? {
              width,
              left: pos[0] - width / 2,
              // Floats just above its gate ring; clamped clear of the nav.
              top: Math.max(pos[1] - h - 14, 88),
            }
          : { width }
      }
      initial={false}
      animate={{ opacity: dimmed ? 0.12 : 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Outward drift when another gate opens (kept off the layout root) */}
      <motion.div
        animate={{ x: dimmed ? drift[0] : 0, y: dimmed ? drift[1] : 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
      {/* Reveal. Reduced motion still gets the gate arriving — just a plain
          fade instead of the iris (clipPath is not a transform, so Motion's
          reduced-motion handling cannot strip it for us). */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "circle(9% at 50% 62%)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "circle(140% at 50% 62%)" }}
        transition={{
          delay: T0 + 0.34 + index * 0.08,
          duration: reduce ? 0.3 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Depth breathe + hover lift on an inner layer so the layout morph stays clean */}
        <motion.div
          animate={reduce || dimmed ? undefined : { scale: [1, 1.013, 1] }}
          transition={{ duration: 7 + index * 0.8, repeat: Infinity, ease: "easeInOut" as const }}
          className="transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
        >
          {/* Window title bar */}
          <div className="flex items-center justify-between border-b border-[rgba(226,173,122,0.28)] px-2.5 py-1.5">
            <span className="font-display text-[9px] font-semibold uppercase tracking-[0.2em] text-copper-soft">
              {t(dict, panel.labelKey)}
            </span>
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-1 w-1 rounded-full bg-copper-soft/80" />
              <span className="h-1 w-1 rounded-full bg-copper-soft/40" />
            </span>
          </div>
          {/* Aperture frame: the maze region under this gate, preview inset */}
          <div className="relative" style={{ padding: FRAME_PAD }}>
            {/* Aperture fills this padded frame: full panel width, and the
                panel height minus the title bar. */}
            <Aperture angle={panel.angle} r={panel.r} w={width} h={h - TITLE_H} />
            {/* Copper light pooling up from the gate below */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 50% 58%, rgba(192,133,82,0.18), transparent 62%)" }}
            />
            <div className="relative overflow-hidden rounded-lg ring-1 ring-[rgba(226,173,122,0.22)]">
              {/* Preview animations stay frozen until the gate is hovered */}
              <MotionConfig reducedMotion={hovered && !reduce ? "user" : "always"}>
                <GatePoster panel={panel} width={previewW} />
              </MotionConfig>
              <div
                aria-hidden="true"
                className="holo-fog absolute inset-0 opacity-80 transition-opacity duration-300 group-hover:opacity-40"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function HoloDeck({ dict }: HoloDeckProps) {
  const reduce = useReducedMotion() ?? false;
  const [isMobile, setIsMobile] = useState(false);
  const [layout, setLayout] = useState<LayoutName>("ring");

  // Prototype deep-link: /?layout=diagonal previews the alternate composition.
  // One-shot URL → state sync after hydration (avoids an SSR mismatch).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("layout") === "diagonal") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLayout("diagonal");
    }
  }, []);
  const [active, setActive] = useState<PanelDef | null>(null);
  const [hovered, setHovered] = useState<PanelKey | null>(null);
  // Gate rect captured at click, expressed as the transform that maps the
  // fullscreen overlay onto it — the overlay animates from this to identity.
  const [origin, setOrigin] = useState<{ scale: number; x: number; y: number } | null>(null);
  // 'opening' → the zoom runs; 'handoff' → landed, fading out
  const phaseRef = useRef<"idle" | "opening" | "handoff">("idle");
  // Mirror of `active` for timers/callbacks whose closures predate setState.
  const activeRef = useRef<PanelDef | null>(null);

  // Render floating deck vs mobile grid via JS (CSS hiding would mount two
  // elements with the same layoutId, which breaks the shared morph).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    // Both signals: some embedded browsers miss mq change on emulated resize.
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply, { passive: true });
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  // Measure the hero so maze coordinates can be slice-projected to px —
  // the same projection MazeScene's SVGs use, so gates sit ON the maze.
  const deckRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox({ w: r.width, h: r.height });
    };
    measure(); // sync first paint — RO callbacks can lag (or never fire in embedded panes)
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Parallax for the whole gate layer (corridors + windows together, so they
  // never separate). Same source, sign and spring as the maze — previously
  // this had its own listener, its own spring, and a different multiplier on
  // x than on y, so the gates travelled on a different arc from the maze.
  // DEPTH.gate is the largest factor: the gates float nearest the camera.
  const { sx: rawX, sy: rawY } = usePointerParallax(reduce || isMobile);
  const sx = useTransform(rawX, (v) => v * DEPTH.gate);
  const sy = useTransform(rawY, (v) => v * DEPTH.gate);

  function scrollToTarget(key: PanelKey) {
    // Record the landing as a history entry (PanelKey ⊂ SectionKey).
    navigateToSection(key);
  }

  function open(panel: PanelDef) {
    // Reduced motion gets the SAME journey, quietly: the overlay still opens
    // and still hands off to the real section — it simply crossfades instead
    // of zooming, and lands sooner. (It used to jump straight to the
    // section, which skipped the whole interaction.)
    phaseRef.current = "opening";
    activeRef.current = panel;

    // Where the gate sits right now, so the overlay can zoom out of it using
    // nothing but transform + opacity. This replaced a shared-layoutId morph,
    // which re-read and re-wrote layout on every frame — the single most
    // expensive thing that used to happen during a page change.
    const rect = document.getElementById(`holo-btn-${panel.key}`)?.getBoundingClientRect();
    setOrigin(
      rect
        ? {
            scale: Math.max(rect.width / window.innerWidth, 0.05),
            x: rect.left + rect.width / 2 - window.innerWidth / 2,
            y: rect.top + rect.height / 2 - window.innerHeight / 2,
          }
        : null
    );

    document.documentElement.style.overflow = "hidden";
    setActive(panel);
    // Safety net in case the animation never reports completion (interrupted,
    // or a hidden tab where rAF stops). Guarded by phaseRef → a no-op if the
    // zoom already completed or Esc was hit.
    window.setTimeout(handoff, reduce ? 300 : 450);
  }

  function closeBack() {
    // Esc / X — return the window to its floating spot (morph back).
    phaseRef.current = "idle";
    document.documentElement.style.overflow = "";
    const key = activeRef.current?.key;
    activeRef.current = null;
    setActive(null);
    if (key) document.getElementById(`holo-btn-${key}`)?.focus();
  }

  function handoff() {
    // Zoom finished → land on the real section and fade the overlay away.
    const panel = activeRef.current;
    if (phaseRef.current !== "opening" || !panel) return;
    phaseRef.current = "handoff";
    document.documentElement.style.overflow = "";
    scrollToTarget(panel.key);
    window.setTimeout(() => {
      phaseRef.current = "idle";
      activeRef.current = null;
      setActive(null);
    }, 240);
  }

  // Esc while the overlay is mid-morph → back to the floating deck (the
  // landing page). After handoff the global Esc handler in Nav takes over.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current === "opening") closeBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // Register the expansion while it is on screen: Nav stands down from its
  // Esc handler, and a browser Back press (via SiteHistory) returns to the
  // floating deck rather than leaving the site.
  useEffect(() => {
    if (!active) return;
    return pushOverlay(closeBack);
  }, [active]);

  const defs = LAYOUTS[layout];
  const panels: PanelDef[] = BASE.map((b) => ({ ...b, ...defs[b.key] }));

  // Slice projection: maze (1440×1440, centered, cover) → hero px.
  const proj = box
    ? (() => {
        const s = Math.max(box.w, box.h) / MAZE_SIZE;
        return { s, ox: (box.w - MAZE_SIZE * s) / 2, oy: (box.h - MAZE_SIZE * s) / 2 };
      })()
    : null;
  const toScreen = (angle: number, r: number): [number, number] => {
    const [x, y] = ptN(r, angle);
    return [x * proj!.s + proj!.ox, y * proj!.s + proj!.oy];
  };

  return (
    <>
      {/* Deck layer — corridors + gate windows, in FRONT of the figure (z-20) */}
      <div ref={deckRef} className="pointer-events-none absolute inset-0 z-20">
        {isMobile ? (
          <div className="absolute inset-x-4 top-20 grid grid-cols-2 justify-items-center gap-3">
            {panels.map((p, i) => (
              <HoloPanel
                key={p.key}
                panel={p}
                dict={dict}
                pos={null}
                width={PANEL_W_MOBILE}
                floating={false}
                index={i}
                reduce={reduce}
                hovered={hovered === p.key}
                dimmed={!!active && active.key !== p.key}
                drift={[0, 0]}
                onOpen={open}
                onHover={setHovered}
              />
            ))}
          </div>
        ) : (
          proj && (
            <motion.div style={{ x: sx, y: sy }} className="absolute inset-0">
              {/* Lit corridors — real maze paths from the core to each gate */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1440 1440"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
              >
                {panels.map((p, i) => {
                  const d = CORRIDORS[layout][p.key];
                  const lit = hovered === p.key || active?.key === p.key;
                  const dim = !!active && active.key !== p.key;
                  const [gx, gy] = ptN(p.r, p.angle);
                  return (
                    <g key={p.key} opacity={dim ? 0.18 : 1} style={{ transition: "opacity 0.4s" }}>
                      {/* Corridor floor shadow */}
                      <motion.path
                        d={d}
                        stroke="#04060a"
                        strokeOpacity={0.55}
                        strokeWidth={10}
                        strokeLinecap="round"
                        initial={reduce ? false : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: T0 + i * 0.08, duration: 0.45, ease: "easeOut" }}
                      />
                      {/* Copper light along the path */}
                      <motion.path
                        d={d}
                        stroke={lit ? "#e2ad7a" : "#c08552"}
                        strokeOpacity={lit ? 0.95 : 0.6}
                        strokeWidth={lit ? 4.5 : 3}
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 6px rgba(192,133,82,0.55))" }}
                        initial={reduce ? false : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: T0 + i * 0.08, duration: 0.45, ease: "easeOut" }}
                      />
                      {/* Traveling pulse — light walking the corridor outward */}
                      {!reduce && (
                        <motion.path
                          d={d}
                          pathLength={1}
                          stroke="#f0c896"
                          strokeOpacity={0.9}
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeDasharray="0.07 0.93"
                          animate={{ strokeDashoffset: [0, -1] }}
                          transition={{
                            delay: T0 + 0.45 + i * 0.3,
                            duration: 3.2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      )}
                      {/* Gate ring where the corridor surfaces — quiet mode
                          fades it in rather than springing it open */}
                      <motion.g
                        style={{ transformBox: "fill-box", transformOrigin: "center" }}
                        initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                        transition={
                          reduce
                            ? { delay: T0 + 0.3 + i * 0.08, duration: 0.28 }
                            : { delay: T0 + 0.3 + i * 0.08, type: "spring", stiffness: 320, damping: 20 }
                        }
                      >
                        <circle cx={gx} cy={gy} r={13} stroke="#e2ad7a" strokeOpacity={lit ? 0.9 : 0.5} strokeWidth={2} />
                        <circle cx={gx} cy={gy} r={4} fill="#e2ad7a" opacity={0.9} />
                      </motion.g>
                    </g>
                  );
                })}
              </svg>

              {panels.map((p, i) => {
                const pos = toScreen(p.angle, p.r);
                const core = toScreen(0, 0); // maze center in screen px
                const dx = pos[0] - core[0];
                const dy = pos[1] - core[1];
                const len = Math.hypot(dx, dy) || 1;
                return (
                  <HoloPanel
                    key={p.key}
                    panel={p}
                    dict={dict}
                    pos={pos}
                    width={p.w}
                    floating
                    index={i}
                    reduce={reduce}
                    hovered={hovered === p.key}
                    dimmed={!!active && active.key !== p.key}
                    drift={[(dx / len) * 44, (dy / len) * 44]}
                    onOpen={open}
                    onHover={setHovered}
                  />
                );
              })}
            </motion.div>
          )
        )}

        {/* PROTOTYPE control — compare the two compositions live. Remove
            (with its state) once a layout is chosen. */}
        {!isMobile && !active && (
          <div className="pointer-events-auto absolute bottom-8 right-6 z-30">
            <button
              type="button"
              onClick={() => setLayout((l) => (l === "ring" ? "diagonal" : "ring"))}
              className="liquid-glass-pill rounded-full px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-copper-soft"
            >
              Layout: {layout === "ring" ? "Ring" : "Diagonal"} ⇄
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen expansion — the gate "opens into" the real section.
          Zooms out of the gate using transform + opacity ONLY. This was a
          shared-layoutId morph, which projects layout every frame — over a
          hero this heavy it was the main reason changing page felt sluggish.
          Scale is uniform so nothing distorts, and the fade covers the
          difference between the gate's aspect and the viewport's. Quiet mode
          skips straight to the crossfade. */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.key}
            initial={
              reduce || !origin
                ? { opacity: 0 }
                : { opacity: 0, scale: origin.scale, x: origin.x, y: origin.y }
            }
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.22 } }}
            transition={{ duration: reduce ? 0.25 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={handoff}
            style={{ transformOrigin: "center center", willChange: "transform, opacity" }}
            className="fixed inset-0 z-[60] overflow-hidden bg-abyss"
          >
            {/* No close button by design: Esc is the way back (handled above
                mid-morph, and globally in Nav once the section has landed). */}
            <SectionBackdrop variant={active.variant} subtle={active.key === "contact"} />
            <div className="relative z-10 h-full">
              {active.key === "contact" ? (
                <div className="flex h-full flex-col overflow-y-auto">
                  <Contact dict={dict} mini />
                </div>
              ) : (
                renderSection(active.key, dict)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
