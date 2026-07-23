"use client";

import { motion } from "framer-motion";

/**
 * Decorative backdrop shared by every non-hero section. Ties the flat
 * content sections to the hero artwork with a drafting-grid + copper-glow
 * base and a per-section line motif (reticle / rings / contours) that draws
 * itself in on scroll. Purely decorative: aria-hidden, pointer-events-none,
 * and all motion is CSS/Framer gated on prefers-reduced-motion.
 */

type Variant = "reticle" | "rings" | "contours";

interface SectionBackdropProps {
  variant: Variant;
  /** Lighter treatment for sections dominated by a large dark card. */
  subtle?: boolean;
}

const NAVY = "#232833";
const COPPER = "#c08552";

// Deterministic particle field (no Math.random → no hydration mismatch).
const PARTICLES = [
  { x: "12%", y: "24%", s: 3, d: 11, delay: 0 },
  { x: "27%", y: "66%", s: 2, d: 14, delay: 2 },
  { x: "45%", y: "17%", s: 4, d: 13, delay: 4 },
  { x: "59%", y: "77%", s: 2, d: 16, delay: 1 },
  { x: "72%", y: "33%", s: 3, d: 12, delay: 3 },
  { x: "85%", y: "61%", s: 2, d: 15, delay: 5 },
  { x: "20%", y: "47%", s: 2, d: 17, delay: 6 },
  { x: "66%", y: "13%", s: 3, d: 12, delay: 2.5 },
  { x: "90%", y: "41%", s: 2, d: 14, delay: 4.5 },
  { x: "37%", y: "87%", s: 3, d: 13, delay: 1.5 },
];

// Stroke draw-in: each element reveals in sequence via its `custom` index.
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: "easeInOut" as const, delay: 0.2 + i * 0.12 },
      opacity: { duration: 0.4, delay: 0.2 + i * 0.12 },
    },
  }),
};

const viewport = { once: true, margin: "-12%" } as const;

// Precomputed radial spokes for the Rings motif. Rounding to whole numbers
// keeps server and client markup byte-identical (raw Math.cos/sin floats
// differ in their last digit across environments → hydration mismatch).
const RING_SPOKES = [0, 60, 120, 180, 240, 300].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x1: Math.round(250 + 60 * Math.cos(rad)),
    y1: Math.round(250 + 60 * Math.sin(rad)),
    x2: Math.round(250 + 250 * Math.cos(rad)),
    y2: Math.round(250 + 250 * Math.sin(rad)),
  };
});

/** Services — an aiming reticle / target, top-right. */
function Reticle() {
  return (
    <motion.svg
      className="absolute -right-20 -top-16 h-[32rem] w-[32rem] max-w-[70vw]"
      viewBox="0 0 400 400"
      fill="none"
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      <motion.circle cx="200" cy="200" r="58" stroke={COPPER} strokeWidth="1.4" variants={draw} custom={0} />
      <motion.circle cx="200" cy="200" r="112" stroke={NAVY} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 7" variants={draw} custom={1} />
      <motion.circle cx="200" cy="200" r="168" stroke={COPPER} strokeOpacity="0.55" strokeWidth="1" variants={draw} custom={2} />
      <motion.line x1="200" y1="12" x2="200" y2="388" stroke={NAVY} strokeOpacity="0.35" strokeWidth="1" variants={draw} custom={1.4} />
      <motion.line x1="12" y1="200" x2="388" y2="200" stroke={NAVY} strokeOpacity="0.35" strokeWidth="1" variants={draw} custom={1.7} />
      <motion.path d="M200 150 L200 250 M150 200 L250 200" stroke={COPPER} strokeWidth="1.4" variants={draw} custom={2.4} />
    </motion.svg>
  );
}

/** Portfolio — big offset labyrinth rings, bottom-left. */
function Rings() {
  return (
    <motion.svg
      className="absolute -bottom-48 -left-48 h-[46rem] w-[46rem] max-w-[90vw]"
      viewBox="0 0 500 500"
      fill="none"
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {[60, 110, 160, 210, 250].map((r, i) => (
        <motion.circle
          key={r}
          cx="250"
          cy="250"
          r={r}
          stroke={i % 2 ? NAVY : COPPER}
          strokeOpacity={i % 2 ? 0.4 : 0.6}
          strokeWidth="1.3"
          strokeDasharray={`${Math.round(r * 1.5)} ${Math.round(r * 0.55)}`}
          strokeLinecap="round"
          variants={draw}
          custom={i}
        />
      ))}
      {RING_SPOKES.map((s, i) => (
        <motion.line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={NAVY}
          strokeOpacity="0.14"
          strokeWidth="1"
          variants={draw}
          custom={2 + i * 0.2}
        />
      ))}
    </motion.svg>
  );
}

/** About — topographic contour lines, echoing the wireframe hero. */
function Contours() {
  return (
    <motion.svg
      className="absolute -right-24 bottom-[-6rem] h-[38rem] w-[38rem] max-w-[80vw]"
      viewBox="0 0 500 500"
      fill="none"
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.ellipse
          key={i}
          cx="250"
          cy="250"
          rx={70 + i * 36}
          ry={44 + i * 27}
          transform="rotate(-20 250 250)"
          stroke={i % 2 ? COPPER : NAVY}
          strokeOpacity={i % 2 ? 0.5 : 0.28}
          strokeWidth="1.2"
          variants={draw}
          custom={i}
        />
      ))}
    </motion.svg>
  );
}

/** Drafting registration mark in a corner. `corner` rotates the L + dot. */
function CornerMark({ className, rotate }: { className: string; rotate: number }) {
  return (
    <motion.svg
      className={`absolute h-6 w-6 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      style={{ rotate }}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      <motion.path d="M1 23 L1 1 L23 1" stroke={COPPER} strokeWidth="1.4" variants={draw} custom={0} />
      <circle cx="1" cy="1" r="1.6" fill={COPPER} />
    </motion.svg>
  );
}

export default function SectionBackdrop({ variant, subtle }: SectionBackdropProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base wash + drafting grid */}
      <div className="paper-wash absolute inset-0" />
      <div className={`blueprint-grid decor-drift absolute inset-0 ${subtle ? "opacity-40" : "opacity-90"}`} />

      {/* Breathing copper glow */}
      <div
        className="decor-breathe absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(192,133,82,0.18), transparent 70%)" }}
      />
      <div
        className="decor-breathe absolute -bottom-48 -left-32 h-[36rem] w-[36rem] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(35,40,51,0.10), transparent 70%)", animationDelay: "3s" }}
      />

      {/* Corner registration marks — cleared below the floating navbar */}
      <CornerMark className="left-6 top-24" rotate={0} />
      <CornerMark className="right-6 top-24" rotate={90} />
      <CornerMark className="right-6 bottom-8" rotate={180} />
      <CornerMark className="left-6 bottom-8" rotate={270} />

      {/* Signature line motif */}
      <div className={subtle ? "opacity-60" : "opacity-100"}>
        {variant === "reticle" && <Reticle />}
        {variant === "rings" && <Rings />}
        {variant === "contours" && <Contours />}
      </div>

      {/* Drifting dust particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="decor-particle absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            background: i % 3 === 0 ? COPPER : NAVY,
            opacity: 0.3,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
