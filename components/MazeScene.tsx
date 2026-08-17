"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { BANDS, type BandDef } from "@/lib/mazeGeometry";

/**
 * MazeScene — the landing-page world: a vast circular labyrinth seen from
 * above, falling away toward a lit center (reference artwork: the 3D maze
 * vortex). Depth is real, not printed:
 *  - every wall is extruded (a dark under-edge offset below a lit top face,
 *    both growing with radius — outer walls are nearer the camera),
 *  - three radial bands parallax at different rates with the mouse,
 *  - the middle band revolves imperceptibly slowly,
 *  - a copper core glows at the center of the maze (the visitor's goal),
 *  - a heavy vignette swallows the corners.
 * Purely decorative (aria-hidden). All motion gates on reduced-motion.
 * Geometry lives in lib/mazeGeometry (module-scope, fixed seed) so server
 * and client markup are byte-identical — and so HoloDeck can reuse the
 * exact same walls for its window apertures and corridors.
 */

/** One parallax band rendered as its own full-bleed SVG. */
function Band({
  band,
  x,
  y,
  reduce,
}: {
  band: BandDef;
  x: ReturnType<typeof useTransform<number, number>>;
  y: ReturnType<typeof useTransform<number, number>>;
  reduce: boolean;
}) {
  return (
    <motion.div className="absolute inset-0" style={{ x, y }}>
      <motion.div
        className="absolute inset-0"
        animate={band.revolve && !reduce ? { rotate: 360 } : undefined}
        transition={{ duration: 420, repeat: Infinity, ease: "linear" }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 1440"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          {/* Under-edges first (the dark drop that makes walls stand up) */}
          <g stroke="#04060a" strokeOpacity="0.75" strokeLinecap="round">
            {band.walls.map((wall, i) => (
              <path
                key={`s${i}`}
                d={wall.d}
                strokeWidth={wall.w + 1}
                transform={`translate(0 ${wall.dy.toFixed(2)})`}
              />
            ))}
          </g>
          {/* Lit top faces */}
          <g strokeLinecap="round" strokeOpacity="0.85">
            {band.walls.map((wall, i) => (
              <path key={`t${i}`} d={wall.d} stroke={wall.color} strokeWidth={wall.w} />
            ))}
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default function MazeScene() {
  const reduce = useReducedMotion() ?? false;

  // Mouse parallax shared by all bands; each band scales it by depth.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 45, damping: 20 });
  const sy = useSpring(py, { stiffness: 45, damping: 20 });
  const layers = [
    { x: useTransform(sx, (v) => v * BANDS[0].mult), y: useTransform(sy, (v) => v * BANDS[0].mult) },
    { x: useTransform(sx, (v) => v * BANDS[1].mult), y: useTransform(sy, (v) => v * BANDS[1].mult) },
    { x: useTransform(sx, (v) => v * BANDS[2].mult), y: useTransform(sy, (v) => v * BANDS[2].mult) },
  ];

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * -1);
      py.set((e.clientY / window.innerHeight - 0.5) * -1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, px, py]);

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-abyss"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {/* Lit floor at the heart of the maze */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, rgba(226,231,238,0.11) 0%, rgba(226,231,238,0.04) 14%, transparent 26%)",
        }}
      />

      {BANDS.map((band, i) => (
        <Band key={i} band={band} x={layers[i].x} y={layers[i].y} reduce={reduce} />
      ))}

      {/* The copper core — the goal at the center of the labyrinth */}
      <div
        className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "26vmin",
          height: "26vmin",
          background: "radial-gradient(circle, rgba(192,133,82,0.32), rgba(192,133,82,0.08) 45%, transparent 70%)",
        }}
      />
      <motion.span
        className="absolute left-1/2 top-[46%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper-soft"
        style={{ boxShadow: "0 0 18px 4px rgba(226,173,122,0.75)" }}
        animate={reduce ? undefined : { scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vignette — the maze falls into darkness at the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, transparent 16%, rgba(6,8,12,0.35) 52%, rgba(6,8,12,0.88) 100%)",
        }}
      />
    </motion.div>
  );
}
