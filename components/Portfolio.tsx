"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import { portfolio } from "@/content/portfolio";
import SectionBackdrop from "@/components/SectionBackdrop";

interface PortfolioProps {
  dict: Dictionary;
  /** Preview mode (holo windows/overlay): no id, no snap, no backdrop. */
  mini?: boolean;
}

/**
 * Placeholder art, one entry per project index (markup, not data).
 * Monochrome navy/gray palette so the tiles read as one family.
 */
const ART: React.ReactElement[] = [
  // 0 — Aurora Studio: diagonal gray → navy
  <div
    key="art-0"
    aria-hidden="true"
    className="absolute inset-0"
    style={{ background: "linear-gradient(135deg, #55524a 0%, #1b1f27 55%, #7d7a70 130%)" }}
  />,
  // 1 — Nordika Shop: diagonal stripes
  <svg key="art-1" aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
    <defs>
      <pattern id="stripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="28" height="28" fill="#1b1f27" />
        <rect width="10" height="28" fill="#7d7a70" opacity="0.55" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#stripes)" />
  </svg>,
  // 2 — Pulse Analytics: conic sweep with a copper glint
  <div
    key="art-2"
    aria-hidden="true"
    className="absolute inset-0"
    style={{ background: "conic-gradient(from 210deg at 70% 30%, #1b1f27, #7d7a70 40%, #e2ad7a 60%, #1b1f27 80%)" }}
  />,
  // 3 — Terra: deep radial gray → navy
  <div
    key="art-3"
    aria-hidden="true"
    className="absolute inset-0"
    style={{ background: "radial-gradient(120% 120% at 20% 20%, #d9d4c9 0%, #55524a 45%, #1b1f27 100%)" }}
  />,
  // 4 — Forma Gym: dot matrix + copper circle
  <svg key="art-4" aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
    <defs>
      <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#1b1f27" />
        <circle cx="3" cy="3" r="1.6" fill="#d9d4c9" opacity="0.6" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
    <circle cx="75%" cy="35%" r="70" fill="none" stroke="#c08552" strokeWidth="20" opacity="0.6" />
  </svg>,
  // 5 — Café Mono: concentric arcs
  <svg key="art-5" aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
    <rect width="100%" height="100%" fill="#1b1f27" />
    <g fill="none" strokeWidth="2.5">
      <circle cx="25%" cy="110%" r="70" stroke="#e2ad7a" />
      <circle cx="25%" cy="110%" r="105" stroke="#d9d4c9" opacity="0.8" />
      <circle cx="25%" cy="110%" r="140" stroke="#7d7a70" opacity="0.6" />
      <circle cx="25%" cy="110%" r="175" stroke="#7d7a70" opacity="0.4" />
      <circle cx="25%" cy="110%" r="210" stroke="#55524a" opacity="0.25" />
    </g>
  </svg>,
];

export default function Portfolio({ dict, mini }: PortfolioProps) {
  return (
    <section
      id={mini ? undefined : "portfolio"}
      className={
        mini
          ? "relative h-full overflow-hidden"
          : "relative h-svh snap-start snap-always overflow-hidden"
      }
    >
      {!mini && <SectionBackdrop variant="rings" />}
      <div className="relative z-10 flex h-full flex-col overflow-y-auto">
        {/* min-h-0 + flex-1 grid: tiles stretch to exactly fill the viewport */}
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 pb-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-copper-deep">
              {t(dict, "portfolio.kicker")}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t(dict, "portfolio.title")}
            </h2>
            <p className="mt-3 text-muted">{t(dict, "portfolio.sub")}</p>
          </motion.div>

          <div className="mt-8 grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-3 lg:grid-cols-3 lg:grid-rows-2 lg:gap-4">
            {portfolio.map((project, index) => (
              <motion.article
                key={project.titleKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: "easeOut" }}
                className="group relative min-h-24 overflow-hidden rounded-2xl bg-surface ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-xl"
              >
                {ART[index]}
                <div className="liquid-glass-dark absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 rounded-none border-x-0 border-b-0 px-4 py-2.5">
                  <h3 className="truncate font-display text-sm font-semibold text-night">
                    {t(dict, project.titleKey)}
                  </h3>
                  <span className="hidden shrink-0 text-[10px] uppercase tracking-wider text-night/60 sm:block">
                    {project.tag}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
