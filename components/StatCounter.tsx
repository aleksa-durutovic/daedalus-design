"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

interface StatCounterProps {
  value: number;
  label: string;
  suffix?: string;
}

export default function StatCounter({ value, label, suffix = "" }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      // Skip the animation entirely; show the final value instantly.
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration: 1.6, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, reducedMotion, value, count]);

  return (
    <div className="bevel-sm bg-line p-px">
      <div className="bevel-sm flex h-full flex-col gap-1 bg-surface px-6 py-5">
        <span ref={ref} className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <motion.span className="text-gradient">{rounded}</motion.span>
          <span className="text-gradient">{suffix}</span>
        </span>
        <span className="text-sm text-muted">{label}</span>
      </div>
    </div>
  );
}
