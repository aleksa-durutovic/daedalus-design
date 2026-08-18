"use client";

import { useEffect, useRef } from "react";
import { MAZE_SIZE, type Wall } from "@/lib/mazeGeometry";

/**
 * mazeRaster — paints the labyrinth into a <canvas> instead of the DOM.
 *
 * The maze used to be ~1,500 live SVG <path> elements: 650 for the three
 * parallax bands and 214 more inside each of the four gate apertures. Every
 * one of them sat in the document, and the parallax transformed them on each
 * frame, forcing re-rasterisation of an enormous amount of vector work. That
 * was the dominant cost of the hero.
 *
 * The shapes themselves are unchanged: Path2D consumes the very same SVG
 * path strings from mazeGeometry, so the drawing is a port, not a redesign.
 * Each band keeps its own canvas so it can still parallax independently and
 * the middle one can still revolve — those are now transforms on a single
 * composited layer rather than on hundreds of paths.
 */

// Path2D objects are expensive to build and the wall set never changes.
const pathCache = new WeakMap<Wall, Path2D>();

function pathFor(wall: Wall): Path2D {
  let p = pathCache.get(wall);
  if (!p) {
    p = new Path2D(wall.d);
    pathCache.set(wall, p);
  }
  return p;
}

/**
 * Draw walls in maze coordinates. Mirrors the old SVG exactly: a dark
 * under-edge offset down by `dy` (the extrusion that makes walls stand up),
 * then the lit top face over it.
 */
export function paintWalls(
  ctx: CanvasRenderingContext2D,
  walls: Wall[],
  // Opacities match the SVG groups they replace: the bands are the lit scene,
  // the apertures are dimmer so the gate's own glass reads on top of them.
  alpha: { under: number; top: number } = { under: 0.75, top: 0.85 }
): void {
  ctx.lineCap = "round";

  ctx.globalAlpha = alpha.under;
  ctx.strokeStyle = "#04060a";
  for (const wall of walls) {
    ctx.save();
    ctx.translate(0, wall.dy);
    ctx.lineWidth = wall.w + 1;
    ctx.stroke(pathFor(wall));
    ctx.restore();
  }

  ctx.globalAlpha = alpha.top;
  for (const wall of walls) {
    ctx.lineWidth = wall.w;
    ctx.strokeStyle = wall.color;
    ctx.stroke(pathFor(wall));
  }

  ctx.globalAlpha = 1;
}

const APERTURE_ALPHA = { under: 0.5, top: 0.4 };

/** Size the backing store for the display's pixel density, then paint. */
function withCanvas(
  canvas: HTMLCanvasElement,
  cssW: number,
  cssH: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap: 3x costs more than it shows
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  draw(ctx);
}

/**
 * A full-bleed band canvas, drawn in the maze's own 1440² coordinate space.
 * The element is sized 100vmax square by the caller, which reproduces the
 * old `preserveAspectRatio="xMidYMid slice"`.
 */
export function useBandCanvas(walls: Wall[]) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const paint = () => withCanvas(canvas, MAZE_SIZE, MAZE_SIZE, (ctx) => paintWalls(ctx, walls));
    paint();
    // Repaint if the window moves to a screen with a different density.
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mq.addEventListener("change", paint);
    return () => mq.removeEventListener("change", paint);
  }, [walls]);

  return ref;
}

/**
 * An aperture canvas: the maze region under one gate, centred on the gate
 * and rotated so "away from the core" points up. Replaces a 214-path SVG.
 */
export function useApertureCanvas(
  walls: Wall[],
  gate: [number, number],
  rotationDeg: number,
  cssW: number,
  cssH: number
) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || cssW <= 0 || cssH <= 0) return;
    const [gx, gy] = gate;
    // The old SVG framed a 460-unit box around the gate with `slice`, so the
    // scale is whichever axis needs the most to cover.
    const scale = Math.max(cssW, cssH) / 460;
    withCanvas(canvas, cssW, cssH, (ctx) => {
      ctx.translate(cssW / 2, cssH / 2);
      ctx.scale(scale, scale);
      ctx.rotate((rotationDeg * Math.PI) / 180);
      ctx.translate(-gx, -gy);
      paintWalls(ctx, walls, APERTURE_ALPHA);
    });
  }, [walls, gate, rotationDeg, cssW, cssH]);

  return ref;
}
