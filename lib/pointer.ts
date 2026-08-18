"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * pointer — ONE window mousemove listener for the whole page.
 *
 * MazeScene and HoloDeck each used to register their own, with different
 * normalisation (-1 vs -12 on x and -8 on y) and different spring configs
 * ({45,20} vs {60,18}). Two springs on two curves meant the gates drifted on
 * a different arc from the maze behind them — which is why the parallax
 * never read as one coherent space, quite apart from the double listener.
 *
 * Everything now shares this source, in normalised units (-0.5..0.5, negated
 * so the scene leans INTO the cursor). Consumers multiply by their own depth
 * factor; ordering those factors is what sells the depth.
 */

type Sub = (x: number, y: number) => void;

const subs = new Set<Sub>();
let listening = false;
let lastX = 0;
let lastY = 0;

function onMove(e: MouseEvent): void {
  lastX = -(e.clientX / window.innerWidth - 0.5);
  lastY = -(e.clientY / window.innerHeight - 0.5);
  for (const fn of subs) fn(lastX, lastY);
}

/** Refcounted subscribe: the listener exists only while someone is watching. */
function subscribePointer(fn: Sub): () => void {
  subs.add(fn);
  if (!listening) {
    window.addEventListener("mousemove", onMove, { passive: true });
    listening = true;
  }
  // Hand the newcomer the current position so it does not start from centre.
  fn(lastX, lastY);
  return () => {
    subs.delete(fn);
    if (subs.size === 0 && listening) {
      window.removeEventListener("mousemove", onMove);
      listening = false;
    }
  };
}

/** Shared spring feel — the reason every layer moves on the same curve. */
export const POINTER_SPRING = { stiffness: 50, damping: 19 } as const;

/**
 * Depth factors, in one place so the ordering stays legible:
 * inner maze moves least, outer maze more, the gates floating in front most.
 */
export const DEPTH = {
  band: [7, 15, 26],
  gate: 20,
} as const;

/** Springed, normalised pointer offset. Inert when reduced motion is on. */
export function usePointerParallax(reduce: boolean) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, POINTER_SPRING);
  const sy = useSpring(py, POINTER_SPRING);

  useEffect(() => {
    if (reduce) return;
    return subscribePointer((x, y) => {
      px.set(x);
      py.set(y);
    });
  }, [reduce, px, py]);

  return { sx, sy };
}
