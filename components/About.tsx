"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import StatCounter from "@/components/StatCounter";
import SectionBackdrop from "@/components/SectionBackdrop";

interface AboutProps {
  dict: Dictionary;
  /** Preview mode (holo windows/overlay): no id, no snap, no backdrop. */
  mini?: boolean;
}

// Placeholder figures; labels come from the i18n dictionary.
const STATS = [
  { value: 24, suffix: "+", labelKey: "stat.projects.label" },
  { value: 18, suffix: "+", labelKey: "stat.clients.label" },
  { value: 5, suffix: "", labelKey: "stat.years.label" },
  { value: 98, suffix: "%", labelKey: "stat.reco.label" },
] as const;

export default function About({ dict, mini }: AboutProps) {
  return (
    <section
      id={mini ? undefined : "about"}
      className={
        mini
          ? "relative h-full overflow-hidden"
          : "relative h-svh snap-start snap-always overflow-hidden"
      }
    >
      {!mini && <SectionBackdrop variant="contours" />}
      <div className="relative z-10 flex h-full flex-col overflow-y-auto">
        <div className="m-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-12 pt-24 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-copper-deep">
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
            className="grid grid-cols-2 gap-4"
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
      </div>
    </section>
  );
}
