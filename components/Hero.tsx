"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import HoloDeck from "@/components/HoloDeck";
import MazeScene from "@/components/MazeScene";

interface HeroProps {
  dict: Dictionary;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Hero({ dict }: HeroProps) {
  return (
    <section className="relative h-svh snap-start snap-always overflow-hidden">
      {/* The labyrinth itself — a 3D maze vortex, not a printed pattern */}
      <MazeScene />

      {/* Dark fade for copy legibility over the maze floor */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-abyss via-abyss/45 to-transparent"
      />

      {/* Hologram windows projected out of the maze — live previews of the site */}
      <HoloDeck dict={dict} />

      {/* Compact copy, bottom-left */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute inset-x-0 bottom-0 z-10"
      >
        <div className="mx-auto w-full max-w-6xl px-6 pb-10 sm:pb-14">
          <motion.p
            variants={item}
            className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-copper-deep"
          >
            {t(dict, "hero.eyebrow")}
          </motion.p>

          <motion.h1
            variants={item}
            className="max-w-xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-fg sm:text-5xl"
          >
            {t(dict, "hero.title.pre")}{" "}
            <span className="text-gradient">{t(dict, "hero.title.accent")}</span>
          </motion.h1>

          <motion.div variants={item} className="mt-6">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="liquid-glass-button group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-sm font-semibold tracking-wide text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
            >
              <span>{t(dict, "hero.cta")}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="h-4 w-4 text-copper transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
