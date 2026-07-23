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
    <div className="flex h-full flex-col gap-1 rounded-2xl bg-surface px-6 py-5 ring-1 ring-white/10">
      <span ref={ref} className="font-display text-4xl font-bold tracking-tight text-night sm:text-5xl">
        <motion.span>{rounded}</motion.span>
        <span className="text-copper-soft">{suffix}</span>
      </span>
      <span className="text-sm text-night/60">{label}</span>
    </div>
  );
}
