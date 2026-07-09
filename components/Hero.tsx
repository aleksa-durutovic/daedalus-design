"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";

interface HeroProps {
  dict: Dictionary;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Hero({ dict }: HeroProps) {
  return (
    <section className="bg-dots relative flex min-h-svh items-center overflow-hidden pt-16">
      {/* Decorative gradient orbs */}
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-violet/25 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-cyan/15 blur-[120px]"
      />
      {/* Signature bevel — large outlined corner cut, top right */}
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-10 hidden h-64 w-64 border border-line lg:block"
        style={{
          clipPath: "polygon(0 0, calc(100% - 96px) 0, 100% 96px, 100% 100%, 0 100%)",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto w-full max-w-6xl px-6 py-24"
      >
        <motion.p
          variants={item}
          className="mb-6 font-display text-xs font-semibold uppercase tracking-[0.25em] text-violet-soft"
        >
          {t(dict, "hero.eyebrow")}
        </motion.p>

        <motion.h1
          variants={item}
          className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {t(dict, "hero.title.pre")}{" "}
          <span className="text-gradient">{t(dict, "hero.title.accent")}</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          {t(dict, "hero.sub")}
        </motion.p>

        <motion.div variants={item} className="mt-12">
          <a
            href="#contact"
            className="group relative inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
          >
            <span
              aria-hidden="true"
              className="bevel-sm absolute inset-0 bg-gradient-to-r from-violet-soft to-cyan transition-opacity group-hover:opacity-85"
            />
            <span className="relative z-10 block px-8 py-4 font-display text-sm font-bold tracking-wide text-night">
              {t(dict, "hero.cta")}
            </span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
