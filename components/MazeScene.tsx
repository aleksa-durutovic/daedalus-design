"use client";

import { motion, useReducedMotion, useTransform } from "framer-motion";
import { BANDS, MAZE_SIZE, type BandDef } from "@/lib/mazeGeometry";
import { useBandCanvas } from "@/lib/mazeRaster";
import { DEPTH, usePointerParallax } from "@/lib/pointer";

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

/**
 * One parallax band, rasterised into a single canvas.
 *
 * Each band keeps its own canvas rather than sharing one bitmap, because the
 * three bands parallax at different rates and the middle one revolves — so
 * they must stay independently transformable. What changed is that the
 * transform now moves ONE composited layer instead of a couple of hundred
 * live SVG paths.
 *
 * The canvas is a 100vmax square: for a square bitmap in a viewport-sized
 * box that is exactly what `preserveAspectRatio="xMidYMid slice"` did.
 */
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
  const ref = useBandCanvas(band.walls);
  return (
    <motion.div className="absolute inset-0" style={{ x, y }}>
      <motion.div
        className="absolute inset-0"
        animate={band.revolve && !reduce ? { rotate: 360 } : undefined}
        transition={{ duration: 420, repeat: Infinity, ease: "linear" }}
      >
        <canvas
          ref={ref}
          width={MAZE_SIZE}
          height={MAZE_SIZE}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "100vmax", height: "100vmax" }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function MazeScene() {
  const reduce = useReducedMotion() ?? false;

  // Pointer parallax comes from the page-wide source in lib/pointer, so the
  // maze and the gates in front of it move on one shared curve.
  const { sx, sy } = usePointerParallax(reduce);
  const layers = [
    { x: useTransform(sx, (v) => v * DEPTH.band[0]), y: useTransform(sy, (v) => v * DEPTH.band[0]) },
    { x: useTransform(sx, (v) => v * DEPTH.band[1]), y: useTransform(sy, (v) => v * DEPTH.band[1]) },
    { x: useTransform(sx, (v) => v * DEPTH.band[2]), y: useTransform(sy, (v) => v * DEPTH.band[2]) },
  ];

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
