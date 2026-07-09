"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import StatCounter from "@/components/StatCounter";

interface AboutProps {
  dict: Dictionary;
}

// Placeholder figures; labels come from the i18n dictionary.
const STATS = [
  { value: 24, suffix: "+", labelKey: "stat.projects.label" },
  { value: 18, suffix: "+", labelKey: "stat.clients.label" },
  { value: 5, suffix: "", labelKey: "stat.years.label" },
  { value: 98, suffix: "%", labelKey: "stat.reco.label" },
] as const;

export default function About({ dict }: AboutProps) {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-violet-soft">
            {t(dict, "about.kicker")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t(dict, "about.title")}
          </h2>
          <p className="mt-6 max-w-prose leading-relaxed text-muted">
            {t(dict, "about.body")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="grid grid-cols-2 gap-5"
        >
          {STATS.map((stat) => (
            <StatCounter
              key={stat.labelKey}
              value={stat.value}
              suffix={stat.suffix}
              label={t(dict, stat.labelKey)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
