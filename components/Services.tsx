"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import { services } from "@/content/services";
import SectionBackdrop from "@/components/SectionBackdrop";

interface ServicesProps {
  dict: Dictionary;
  /** Preview mode (holo windows/overlay): no id, no snap, no backdrop. */
  mini?: boolean;
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

export default function Services({ dict, mini }: ServicesProps) {
  return (
    <section
      id={mini ? undefined : "services"}
      className={
        mini
          ? "relative h-full overflow-hidden"
          : "relative h-svh snap-start snap-always overflow-hidden"
      }
    >
      {!mini && <SectionBackdrop variant="corner" />}
      {/* m-auto inside a scrollable flex column: centered when it fits,
          scrollable (not clipped) on screens too short for the content. */}
      <div className="relative z-10 flex h-full flex-col overflow-y-auto">
        <div className="m-auto w-full max-w-6xl px-6 pb-12 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-copper-deep">
              {t(dict, "services.kicker")}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t(dict, "services.title")}
            </h2>
            <p className="mt-4 text-muted">{t(dict, "services.sub")}</p>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                key={service.titleKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                className="group flex flex-col gap-4 rounded-2xl bg-surface p-6 ring-1 ring-white/10 transition-all duration-300 hover:shadow-xl hover:ring-copper/50 motion-safe:hover:-translate-y-1"
              >
                <span className="liquid-glass-dark flex h-11 w-11 items-center justify-center rounded-xl text-copper-soft">
                  {ICONS[service.icon]}
                </span>
                <h3 className="font-display text-lg font-semibold text-night">
                  {t(dict, service.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-night/65">
                  {t(dict, service.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
