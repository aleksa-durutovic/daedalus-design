"use client";

import { motion } from "framer-motion";

/**
 * Decorative backdrop shared by every non-hero section. A deep parchment
 * wash + tiled labyrinth-wall field, crowned by a large circular labyrinth
 * (concentric broken rings + radial gate walls — the logo's maze, enlarged)
 * that draws itself in on scroll. Purely decorative: aria-hidden,
 * pointer-events-none, and all motion is CSS/Framer gated on
 * prefers-reduced-motion.
 */

type Variant = "corner" | "rings" | "arcs";

interface SectionBackdropProps {
  variant: Variant;
  /** Lighter treatment for sections dominated by a large dark card. */
  subtle?: boolean;
}

const STEEL = "#aeb6c2";
const COPPER = "#c08552";
const EDGE = "#04060a"; // wall under-edge (extrusion shadow)

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
      pathLength: { duration: 1.4, ease: "easeInOut" as const, delay: 0.15 + i * 0.09 },
      opacity: { duration: 0.4, delay: 0.15 + i * 0.09 },
    },
  }),
};

const viewport = { once: true, margin: "-12%" } as const;

/* ------------------------------------------------------------------------
   Circular labyrinth geometry — precomputed at module scope with rounded
   coordinates so server and client markup stay byte-identical.
   ------------------------------------------------------------------------ */

const C = 260; // center of a 520×520 viewBox

function pt(r: number, deg: number): [string, string] {
  const rad = (deg * Math.PI) / 180;
  return [(C + r * Math.cos(rad)).toFixed(2), (C + r * Math.sin(rad)).toFixed(2)];
}

/** Arc segment of a ring between two angles (degrees, clockwise). */
function arc(r: number, a0: number, a1: number): string {
  const [x0, y0] = pt(r, a0);
  const [x1, y1] = pt(r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

/** Radial wall bridging two adjacent rings at a given angle. */
function spoke(r0: number, r1: number, deg: number): string {
  const [x0, y0] = pt(r0, deg);
  const [x1, y1] = pt(r1, deg);
  return `M ${x0} ${y0} L ${x1} ${y1}`;
}

// Hand-tuned wall layout: each ring is broken by gates (the gaps between
// arc segments) and rings are tied together by radial walls — a maze, not
// a target. Angles chosen so gates never align radially.
const RING_ARCS: { r: number; segs: [number, number][] }[] = [
  { r: 44, segs: [[20, 330]] },
  { r: 82, segs: [[60, 175], [200, 350]] },
  { r: 120, segs: [[-40, 40], [75, 200], [230, 300]] },
  { r: 158, segs: [[10, 130], [160, 250], [280, 340]] },
  { r: 196, segs: [[-70, 30], [60, 150], [185, 265]] },
  { r: 234, segs: [[35, 120], [150, 240], [270, 355]] },
];

const SPOKE_WALLS: [number, number, number][] = [
  [44, 82, 40],
  [82, 120, 215],
  [120, 158, 55],
  [158, 196, 300],
  [196, 234, 130],
  [82, 120, 350],
  [158, 196, 170],
];

const MAZE_PATHS: { d: string; copper: boolean }[] = [
  ...RING_ARCS.flatMap((ring, i) =>
    ring.segs.map((s) => ({ d: arc(ring.r, s[0], s[1]), copper: i % 2 === 1 }))
  ),
  ...SPOKE_WALLS.map(([r0, r1, deg]) => ({ d: spoke(r0, r1, deg), copper: false })),
];

/** Per-section placement of the big labyrinth (size / corner / rotation). */
const PLACEMENTS: Record<Variant, { className: string; rotate: number }> = {
  corner: { className: "absolute -right-24 -top-24 h-[36rem] w-[36rem] max-w-[75vw]", rotate: 15 },
  rings: { className: "absolute -bottom-52 -left-52 h-[50rem] w-[50rem] max-w-[95vw]", rotate: 0 },
  arcs: { className: "absolute -right-32 bottom-[-8rem] h-[42rem] w-[42rem] max-w-[85vw]", rotate: -30 },
};

/** The circular labyrinth motif — extruded steel walls, copper rings between
    (the hero maze's little sibling: same 3D language, less detail). */
function Labyrinth({ variant }: { variant: Variant }) {
  const { className, rotate } = PLACEMENTS[variant];
  return (
    <motion.svg
      className={className}
      viewBox="0 0 520 520"
      fill="none"
      style={{ rotate }}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {/* Wall under-edges — the dark drop that lifts walls off the floor. */}
      <motion.g
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1.2, delay: 0.5 } } }}
      >
        {MAZE_PATHS.map((p, i) => (
          <path
            key={`s${i}`}
            d={p.d}
            stroke={EDGE}
            strokeOpacity="0.55"
            strokeWidth={p.copper ? 3.6 : 3.3}
            strokeLinecap="round"
            transform="translate(0 3)"
          />
        ))}
      </motion.g>
      {/* Copper heart of the maze — the logo's "D" position. */}
      <circle cx={C} cy={C} r="7" fill={COPPER} opacity="0.85" />
      {MAZE_PATHS.map((p, i) => (
        <motion.path
          key={i}
          d={p.d}
          stroke={p.copper ? COPPER : STEEL}
          strokeOpacity={p.copper ? 0.6 : 0.42}
          strokeWidth={p.copper ? 2.6 : 2.3}
          strokeLinecap="round"
          variants={draw}
          custom={i * 0.5}
        />
      ))}
    </motion.svg>
  );
}

/** Drafting registration mark in a corner. `rotate` turns the L + dot. */
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
      {/* Dark maze atmosphere + tiled labyrinth-wall field */}
      <div className="abyss-wash absolute inset-0" />
      <div className={`maze-walls decor-drift absolute inset-0 ${subtle ? "opacity-50" : "opacity-100"}`} />

      {/* Breathing glows — warm copper above, cold steel below */}
      <div
        className="decor-breathe absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(192,133,82,0.17), transparent 70%)" }}
      />
      <div
        className="decor-breathe absolute -bottom-48 -left-32 h-[36rem] w-[36rem] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(174,182,194,0.09), transparent 70%)", animationDelay: "3s" }}
      />

      {/* Corner registration marks — cleared below the floating navbar */}
      <CornerMark className="left-6 top-24" rotate={0} />
      <CornerMark className="right-6 top-24" rotate={90} />
      <CornerMark className="right-6 bottom-8" rotate={180} />
      <CornerMark className="left-6 bottom-8" rotate={270} />

      {/* Signature motif — the logo's labyrinth, drawn wall by wall */}
      <div className={subtle ? "opacity-60" : "opacity-100"}>
        <Labyrinth variant={variant} />
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
            background: i % 3 === 0 ? COPPER : STEEL,
            opacity: 0.35,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
