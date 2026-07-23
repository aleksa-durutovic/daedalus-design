"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Contact from "@/components/Contact";
import SectionBackdrop from "@/components/SectionBackdrop";

/**
 * HoloDeck — the hero's floating hologram windows. Each window is a LIVE,
 * scaled-down render of a real page section, positioned in front of the
 * figure as if he projects them from his hands (light beams included).
 * Clicking one expands it fullscreen via a shared layoutId morph, then
 * hands off to the real section (the site "opens" at that page).
 */

interface HoloDeckProps {
  dict: Dictionary;
}

type PanelKey = "services" | "portfolio" | "about" | "contact";

interface PanelDef {
  key: PanelKey;
  labelKey: string;
  variant: "reticle" | "rings" | "contours";
  /** Desktop position (percent of the hero section). */
  left: number;
  top: number;
  /** Beam endpoints in percent: from = a hand, to = panel center. */
  beam: { from: [number, number]; to: [number, number] };
}

// Virtual canvas each live preview renders at before being scaled down.
const VW = 1280;
const VH = 800;
const PANEL_W_DESKTOP = 230;
const PANEL_W_MOBILE = 150;

// Hands in the artwork (percent of a ~16:9 cover'd hero).
const RIGHT_HAND: [number, number] = [56.5, 33];
const LEFT_HAND: [number, number] = [45.5, 52];

const PANELS: PanelDef[] = [
  { key: "services", labelKey: "nav.services", variant: "reticle", left: 12, top: 13, beam: { from: LEFT_HAND, to: [21.5, 22] } },
  { key: "portfolio", labelKey: "nav.portfolio", variant: "rings", left: 33, top: 10, beam: { from: LEFT_HAND, to: [42.5, 19] } },
  { key: "about", labelKey: "nav.about", variant: "contours", left: 52, top: 10, beam: { from: RIGHT_HAND, to: [61.5, 19] } },
  { key: "contact", labelKey: "nav.contact", variant: "reticle", left: 72, top: 13, beam: { from: RIGHT_HAND, to: [81.5, 22] } },
];

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

/** Live scaled-down render of a real section (inert: display only). */
function LivePreview({ panel, dict, width }: { panel: PanelDef; dict: Dictionary; width: number }) {
  const scale = width / VW;
  return (
    <div
      aria-hidden="true"
      inert
      className="pointer-events-none select-none overflow-hidden"
      style={{ width, height: Math.round(VH * scale) }}
    >
      <div style={{ width: VW, height: VH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {renderSection(panel.key, dict)}
      </div>
    </div>
  );
}

/** One hologram window (role=button — real buttons can't nest the preview's interactive HTML). */
function HoloPanel({
  panel,
  dict,
  width,
  floating,
  index,
  reduce,
  onOpen,
  onHover,
}: {
  panel: PanelDef;
  dict: Dictionary;
  width: number;
  floating: boolean;
  index: number;
  reduce: boolean;
  onOpen: (p: PanelDef) => void;
  onHover: (k: PanelKey | null) => void;
}) {
  return (
    <motion.div
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
      style={floating ? { left: `${panel.left}%`, top: `${panel.top}%`, width } : { width }}
      initial={reduce ? false : { opacity: 0, scale: 0.4, y: 26 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.16, type: "spring", stiffness: 210, damping: 20 }}
    >
      {/* Idle float + hover lift live on an inner layer so the layout morph stays clean */}
      <motion.div
        animate={reduce ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 5 + index * 0.9, repeat: Infinity, ease: "easeInOut" as const }}
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      >
        {/* Window title bar */}
        <div className="flex items-center justify-between border-b border-[rgba(140,216,211,0.35)] px-2.5 py-1.5">
          <span className="font-display text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9fe2de]">
            {t(dict, panel.labelKey)}
          </span>
          <span className="flex gap-1" aria-hidden="true">
            <span className="h-1 w-1 rounded-full bg-[#9fe2de]/80" />
            <span className="h-1 w-1 rounded-full bg-[#9fe2de]/40" />
          </span>
        </div>
        <div className="relative">
          <LivePreview panel={panel} dict={dict} width={width} />
          {/* Holo tint + scanlines over the live content */}
          <div aria-hidden="true" className="holo-scan absolute inset-0" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[rgba(140,216,211,0.12)] via-transparent to-[rgba(27,31,39,0.18)] opacity-80 transition-opacity duration-300 group-hover:opacity-40"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HoloDeck({ dict }: HoloDeckProps) {
  const reduce = useReducedMotion() ?? false;
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState<PanelDef | null>(null);
  const [hovered, setHovered] = useState<PanelKey | null>(null);
  // 'opening' → layout morph runs; 'handoff' → layoutId dropped, fading out
  const phaseRef = useRef<"idle" | "opening" | "handoff">("idle");
  // Mirror of `active` for timers/callbacks whose closures predate setState.
  const activeRef = useRef<PanelDef | null>(null);
  const [, forceRender] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

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

  // Mouse parallax: panels + beams drift a few px so they float in depth.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });
  useEffect(() => {
    if (reduce || isMobile) return;
    const onMove = (e: MouseEvent) => {
      px.set(((e.clientX / window.innerWidth) - 0.5) * 16);
      py.set(((e.clientY / window.innerHeight) - 0.5) * 10);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, isMobile, px, py]);

  function scrollToTarget(key: PanelKey) {
    document.getElementById(key)?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
  }

  function open(panel: PanelDef) {
    if (reduce) {
      // Reduced motion: no morph theatrics, just go to the section.
      document.getElementById(panel.key)?.scrollIntoView();
      return;
    }
    phaseRef.current = "opening";
    activeRef.current = panel;
    document.documentElement.style.overflow = "hidden";
    setActive(panel);
    // Safety net: if the layout-complete callback never fires (animation
    // skipped/interrupted), hand off anyway. Guarded by phaseRef, so this
    // is a no-op when the morph completed or the user pressed Esc.
    window.setTimeout(handoff, 1200);
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
    // Morph finished → land on the real section and fade the overlay away.
    const panel = activeRef.current;
    if (phaseRef.current !== "opening" || !panel) return;
    phaseRef.current = "handoff";
    forceRender((n) => n + 1); // re-render overlay without layoutId
    document.documentElement.style.overflow = "";
    scrollToTarget(panel.key);
    window.setTimeout(() => {
      phaseRef.current = "idle";
      activeRef.current = null;
      setActive(null);
    }, 380);
  }

  // Esc closes while the overlay is up.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current === "opening") closeBack();
    };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const width = isMobile ? PANEL_W_MOBILE : PANEL_W_DESKTOP;

  return (
    <>
      {/* Deck layer — beams + windows, in FRONT of the figure (z-20) */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {isMobile ? (
          <div className="absolute inset-x-4 top-20 grid grid-cols-2 justify-items-center gap-3">
            {PANELS.map((p, i) => (
              <HoloPanel
                key={p.key}
                panel={p}
                dict={dict}
                width={width}
                floating={false}
                index={i}
                reduce={reduce}
                onOpen={open}
                onHover={setHovered}
              />
            ))}
          </div>
        ) : (
          <motion.div style={{ x: sx, y: sy }} className="absolute inset-0">
            {/* Light beams from his hands to each window */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ filter: "drop-shadow(0 0 4px rgba(111,211,207,0.7))" }}
            >
              {PANELS.map((p) => {
                const [fx, fy] = p.beam.from;
                const [tx, ty] = p.beam.to;
                const mx = (fx + tx) / 2;
                const my = (fy + ty) / 2 - 7;
                const lit = hovered === p.key;
                return (
                  <g key={p.key} className={lit ? "" : "beam-pulse"}>
                    <path
                      d={`M ${fx} ${fy} Q ${mx} ${my} ${tx} ${ty}`}
                      fill="none"
                      stroke="#6fd3cf"
                      strokeOpacity={lit ? 0.95 : 0.55}
                      strokeWidth={lit ? 2 : 1.2}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle cx={fx} cy={fy} r="0.45" fill="#9fe2de" />
                    <circle cx={tx} cy={ty} r="0.35" fill="#9fe2de" />
                  </g>
                );
              })}
            </svg>

            {PANELS.map((p, i) => (
              <HoloPanel
                key={p.key}
                panel={p}
                dict={dict}
                width={width}
                floating
                index={i}
                reduce={reduce}
                onOpen={open}
                onHover={setHovered}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Fullscreen expansion — the window "opens into" the real section */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.key}
            layoutId={phaseRef.current === "handoff" ? undefined : `holo-${active.key}`}
            onLayoutAnimationComplete={handoff}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="fixed inset-0 z-[60] overflow-hidden bg-night"
          >
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
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeBack}
              aria-label={t(dict, "holo.close")}
              className="liquid-glass-button absolute right-5 top-20 z-20 flex h-11 w-11 items-center justify-center rounded-full text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
