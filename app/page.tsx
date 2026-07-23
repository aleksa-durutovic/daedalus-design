import { MotionConfig } from "framer-motion";
import { getLocale } from "@/lib/getLocale";
import { dictionaries } from "@/content/i18n";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SectionBackdrop from "@/components/SectionBackdrop";

export default async function Home() {
  const locale = await getLocale();
  const dict = dictionaries[locale];

  return (
    // Shared reduced-motion gate: every Framer Motion animation below
    // respects the OS "reduce motion" setting through this single config.
    <MotionConfig reducedMotion="user">
      <Nav dict={dict} locale={locale} />
      <main id="content">
        <Hero dict={dict} />
        <Services dict={dict} />
        <Portfolio dict={dict} />
        <About dict={dict} />
        {/* Contact + footer share the last full-screen snap section — a
            footer-only snap target would strand a mostly-empty screen. */}
        <section className="relative flex h-svh snap-start snap-always flex-col overflow-hidden">
          <SectionBackdrop variant="reticle" subtle />
          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Contact dict={dict} />
          </div>
          <Footer dict={dict} className="relative z-10" />
        </section>
      </main>
    </MotionConfig>
  );
}
