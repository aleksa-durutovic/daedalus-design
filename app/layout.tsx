import type { Metadata, Viewport } from "next";
import { getLocale } from "@/lib/getLocale";
import { dictionaries, t } from "@/content/i18n";
import "./globals.css";

// Colors the browser UI (mobile address bar) to the dark panel navy.
export const viewport: Viewport = {
  themeColor: "#1b1f27",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  const title = t(dict, "meta.title");
  const description = t(dict, "meta.description");
  return {
    // TODO: replace with the real production domain before launch (matches
    // the placeholder used in content/social.ts).
    metadataBase: new URL("https://daedalusdesign.example"),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "sr" ? "sr_RS" : "en_US",
      siteName: "Daedalus Design",
      images: [{ url: "/hero-table-1x.jpg", width: 1365, height: 768 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/hero-table-1x.jpg"],
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const dict = dictionaries[locale];

  return (
    // snap-y snap-mandatory: the document is the snap container — each
    // full-viewport section "changes windows" instead of free-scrolling.
    <html lang={locale} className="snap-y snap-mandatory">
      <head>
        <link
          rel="preload"
          href="/fonts/sora-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body id="top" className="bg-abyss font-sans text-fg antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
        >
          {t(dict, "skip")}
        </a>
        {children}
      </body>
    </html>
  );
}
