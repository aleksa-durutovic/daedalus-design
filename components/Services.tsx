"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import { services } from "@/content/services";

interface ServicesProps {
  dict: Dictionary;
}

/** Inline stroke icons keyed by ServiceItem.icon (markup, not data). */
const ICONS: Record<string, React.ReactElement> = {
  design: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
      <circle cx="19" cy="19" r="1.5" />
    </svg>
  ),
  dev: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-5 5 5 5M16 7l5 5-5 5M13 4l-2 16" />
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
    </svg>
  ),
  seo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l5-5 4 4 8-8M15 8h5v5" />
    </svg>
  ),
};

export default function Services({ dict }: ServicesProps) {
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-violet-soft">
            {t(dict, "services.kicker")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t(dict, "services.title")}
          </h2>
          <p className="mt-4 text-muted">{t(dict, "services.sub")}</p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              className="group bevel bg-line p-px transition-colors hover:bg-violet/50"
            >
              <div className="bevel flex h-full flex-col gap-4 bg-surface p-6">
                <span className="bevel-sm flex h-11 w-11 items-center justify-center bg-night text-violet-soft transition-colors group-hover:text-cyan">
                  {ICONS[service.icon]}
                </span>
                <h3 className="font-display text-lg font-semibold">
                  {t(dict, service.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {t(dict, service.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
