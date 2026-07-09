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
        <Contact dict={dict} />
      </main>
      <Footer dict={dict} />
    </MotionConfig>
  );
}
