/**
 * mazeGeometry — the single source of truth for the labyrinth's shape.
 *
 * Generated once at module scope from a fixed LCG seed and rounded to
 * 2 decimals, so server and client markup are byte-identical (SSR-safe).
 * MazeScene renders the three parallax bands from BANDS; HoloDeck reuses
 * the same walls for its window apertures and walks corridorPath() along
 * real rings and spokes so the lit corridors follow actual maze geometry.
 */

export const MAZE_SIZE = 1440; // square viewBox all maze SVGs share
export const MAZE_C = 720; // center of the viewBox
export const RING_STEP = 34;
const R_MIN = 70;
const R_MAX = 1000;

// Deterministic pseudo-random walk (fixed seed → same maze every render).
let lcg = 987654321;
function rnd(): number {
  lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0;
  return lcg / 4294967296;
}

/** Polar → cartesian, numeric (for JS-side positioning). */
export function ptN(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [MAZE_C + r * Math.cos(rad), MAZE_C + r * Math.sin(rad)];
}

/** Polar → cartesian, stringified for path data (2-decimal, SSR-stable). */
function pt(r: number, deg: number): [string, string] {
  const [x, y] = ptN(r, deg);
  return [x.toFixed(2), y.toFixed(2)];
}

function arc(r: number, a0: number, a1: number): string {
  const [x0, y0] = pt(r, a0);
  const [x1, y1] = pt(r, a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

function spoke(r0: number, r1: number, deg: number): string {
  const [x0, y0] = pt(r0, deg);
  const [x1, y1] = pt(r1, deg);
  return `M ${x0} ${y0} L ${x1} ${y1}`;
}

/** Linear hex interpolation for the wall lighting falloff. */
function mix(c1: string, c2: string, t: number): string {
  const p = (c: string, i: number) => parseInt(c.substr(i, 2), 16);
  const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  const [a, b] = [c1.replace("#", ""), c2.replace("#", "")];
  return `#${h(p(a, 0) + (p(b, 0) - p(a, 0)) * t)}${h(p(a, 2) + (p(b, 2) - p(a, 2)) * t)}${h(
    p(a, 4) + (p(b, 4) - p(a, 4)) * t
  )}`;
}

export interface Wall {
  d: string;
  w: number; // top-face stroke width
  dy: number; // extrusion offset of the under-edge
  color: string;
  r: number; // ring radius this wall belongs to (for aperture filtering)
}

export interface BandDef {
  min: number;
  max: number;
  mult: number; // parallax multiplier (outer = nearer camera = moves more)
  revolve: boolean;
  walls: Wall[];
}

export const BANDS: BandDef[] = [
  { min: 70, max: 330, mult: 7, revolve: false, walls: [] },
  { min: 340, max: 660, mult: 15, revolve: true, walls: [] },
  { min: 670, max: 1000, mult: 26, revolve: false, walls: [] },
];

// ---- generate once at module scope ----
for (let r = R_MIN; r <= R_MAX; r += RING_STEP) {
  const band = BANDS.find((b) => r >= b.min && r <= b.max);
  if (!band) continue;
  const t = (r - R_MIN) / (R_MAX - R_MIN);
  const w = 2 + 7.5 * t;
  const dy = 1.5 + 6.5 * t;
  // Lit near the glowing center, dimming outward (vignette finishes the job).
  const color = mix("#e2e7ee", "#7c8492", t);

  // Broken ring: wall segments separated by gates.
  let walked = rnd() * 360;
  let total = 0;
  while (total < 340) {
    const seg = 20 + rnd() * 55;
    const gap = 9 + rnd() * 11;
    band.walls.push({ d: arc(r, walked, walked + seg), w, dy, color, r });
    walked += seg + gap;
    total += seg + gap;
  }

  // Radial stub walls tying this ring to the next (stay inside the band so
  // the revolving middle band never tears its own geometry).
  if (r + RING_STEP <= band.max) {
    const stubs = 4 + Math.floor(rnd() * 5);
    for (let i = 0; i < stubs; i++) {
      band.walls.push({ d: spoke(r, r + RING_STEP, rnd() * 360), w: w * 0.9, dy, color, r });
    }
  }
}

const ALL_WALLS: Wall[] = BANDS.flatMap((b) => b.walls);

/** Walls whose ring radius lies within ±spread of r — an aperture's view. */
export function wallsNear(r: number, spread: number): Wall[] {
  return ALL_WALLS.filter((w) => Math.abs(w.r - r) <= spread);
}

/**
 * A walkable corridor from near the maze core out to a gate at
 * (rTarget, angleDeg): alternating spokes (radial runs) and ring arcs that
 * converge on the target angle — the same grammar the walls are drawn with.
 * Deterministic per seed so SSR/client markup match.
 */
export function corridorPath(angleDeg: number, rTarget: number, seed: number): string {
  let s = (987 + seed * 7919) >>> 0;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };

  let a = angleDeg + (rand() * 50 - 25);
  let r = 96;
  const [x0, y0] = pt(r, a);
  let d = `M ${x0} ${y0}`;

  while (r < rTarget) {
    // Radial run outward, one or two rings at a time.
    const rn = Math.min(r + RING_STEP * (1 + Math.round(rand())), rTarget);
    const [lx, ly] = pt(rn, a);
    d += ` L ${lx} ${ly}`;
    r = rn;
    if (r >= rTarget) break;

    // Ring arc drifting toward the target angle (with a little wander).
    const rem = angleDeg - a;
    let an = a + rem * (0.3 + rand() * 0.45) + (rand() * 16 - 8);
    if (Math.abs(angleDeg - an) > 40) an = angleDeg + Math.sign(an - angleDeg) * 40;
    const [ax, ay] = pt(r, an);
    d += ` A ${r} ${r} 0 0 ${an > a ? 1 : 0} ${ax} ${ay}`;
    a = an;
  }

  // Land exactly on the gate.
  if (Math.abs(a - angleDeg) > 0.5) {
    const [ex, ey] = pt(rTarget, angleDeg);
    d += ` A ${rTarget} ${rTarget} 0 0 ${angleDeg > a ? 1 : 0} ${ex} ${ey}`;
  }
  return d;
}
