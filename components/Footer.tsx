import type { Dictionary } from "@/types/content";
import { t } from "@/content/i18n";

interface FooterProps {
  dict: Dictionary;
  className?: string;
}

export default function Footer({ dict, className = "" }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={`border-t border-line ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        <p className="text-sm text-muted">
          © {year} Daedalus Design. {t(dict, "footer.rights")}
        </p>

        <a
          href="#top"
          className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          {t(dict, "footer.backToTop")}
        </a>
      </div>
    </footer>
  );
}
