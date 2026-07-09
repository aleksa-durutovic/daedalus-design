"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";
import { portfolio } from "@/content/portfolio";

interface PortfolioProps {
  dict: Dictionary;
}

/**
 * Placeholder art, one entry per project index (markup, not data).
 * 'gradient' cards get CSS gradients; 'svg' cards get inline patterns.
 */
const ART: React.ReactElement[] = [
  // 0 — Aurora Studio: diagonal violet → cyan
  <div
    key="art-0"
    aria-hidden="true"
    className="absolute inset-0"
    style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #312e81 55%, #22d3ee 130%)" }}
  />,
  // 1 — Nordika Shop: diagonal stripes
  <svg key="art-1" aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
    <defs>
      <pattern id="stripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="28" height="28" fill="#14141c" />
        <rect width="10" height="28" fill="#8b5cf6" opacity="0.55" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#stripes)" />
  </svg>,
  // 2 — Pulse Analytics: conic sweep
  <div
    key="art-2"
    aria-hidden="true"
    className="absolute inset-0"
    style={{ background: "conic-gradient(from 210deg at 70% 30%, #0b0b10, #8b5cf6 40%, #22d3ee 60%, #0b0b10 80%)" }}
  />,
  // 3 — Terra: deep radial violet
  <div
    key="art-3"
    aria-hidden="true"
    className="absolute inset-0"
    style={{ background: "radial-gradient(120% 120% at 20% 20%, #a78bfa 0%, #4c1d95 45%, #0b0b10 100%)" }}
  />,
  // 4 — Forma Gym: dot matrix + circle
  <svg key="art-4" aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
    <defs>
      <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#14141c" />
        <circle cx="3" cy="3" r="1.6" fill="#22d3ee" opacity="0.6" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
    <circle cx="75%" cy="35%" r="70" fill="none" stroke="#8b5cf6" strokeWidth="20" opacity="0.75" />
  </svg>,
  // 5 — Café Mono: concentric arcs
  <svg key="art-5" aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
    <rect width="100%" height="100%" fill="#14141c" />
    <g fill="none" strokeWidth="2.5">
      <circle cx="25%" cy="110%" r="70" stroke="#a78bfa" />
      <circle cx="25%" cy="110%" r="105" stroke="#8b5cf6" opacity="0.8" />
      <circle cx="25%" cy="110%" r="140" stroke="#22d3ee" opacity="0.6" />
      <circle cx="25%" cy="110%" r="175" stroke="#8b5cf6" opacity="0.4" />
      <circle cx="25%" cy="110%" r="210" stroke="#22d3ee" opacity="0.25" />
    </g>
  </svg>,
];

export default function Portfolio({ dict }: PortfolioProps) {
  return (
    <section id="portfolio" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-violet-soft">
            {t(dict, "portfolio.kicker")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t(dict, "portfolio.title")}
          </h2>
          <p className="mt-4 text-muted">{t(dict, "portfolio.sub")}</p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((project, index) => (
            <motion.article
              key={project.titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: "easeOut" }}
              className="bevel bg-line p-px"
            >
              <div className="bevel relative aspect-[4/3] overflow-hidden bg-surface">
                {ART[index]}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-night/75 px-5 py-4 backdrop-blur-sm">
                  <h3 className="font-display text-base font-semibold">
                    {t(dict, project.titleKey)}
                  </h3>
                  <span className="shrink-0 text-xs uppercase tracking-wider text-muted">
                    {project.tag}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
