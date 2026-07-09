import type { Dictionary, Locale } from '@/types/content';

/**
 * Single flat key namespace. `sr` is the source of truth for the key set;
 * `en` is typed against it via `satisfies`, so a missing or mistyped key
 * is a compile error, not a silent runtime gap.
 */
const sr = {
  'meta.title': 'Beverly Design — Studio za dizajn i izradu web sajtova',
  'meta.description':
    'Pravimo brze, moderne i prepoznatljive web sajtove koji vašem biznisu donose klijente.',

  'skip': 'Preskoči na sadržaj',

  'nav.services': 'Usluge',
  'nav.portfolio': 'Portfolio',
  'nav.about': 'O nama',
  'nav.contact': 'Kontakt',

  'toggle.label.sr': 'Prebaci na srpski',
  'toggle.label.en': 'Prebaci na engleski',
  'toggle.announce': 'Jezik je promenjen na srpski',

  'hero.eyebrow': 'Studio za web dizajn i razvoj',
  'hero.title.pre': 'Sajtovi koji',
  'hero.title.accent': 'osvajaju klijente',
  'hero.sub':
    'Od prve skice do lansiranja — dizajniramo i gradimo brze, moderne sajtove koji rade za vaš biznis.',
  'hero.cta': 'Započnimo projekat',

  'services.kicker': 'Usluge',
  'services.title': 'Šta radimo',
  'services.sub': 'Četiri stvari. Svaku radimo temeljno.',

  'svc.design.title': 'Web dizajn',
  'svc.design.desc':
    'Dizajn vođen sadržajem i konverzijom — čist, savremen i veran vašem brendu.',
  'svc.dev.title': 'Web development',
  'svc.dev.desc':
    'Brzi i pouzdani sajtovi, građeni modernim alatima i čistim kodom.',
  'svc.brand.title': 'Brending',
  'svc.brand.desc':
    'Identitet koji se pamti: logotip, boje, tipografija i ton komunikacije.',
  'svc.seo.title': 'SEO i performanse',
  'svc.seo.desc':
    'Tehnički zdravi sajtovi koje pretraživači vole, a posetioci ne napuštaju.',

  'portfolio.kicker': 'Portfolio',
  'portfolio.title': 'Izdvojeni radovi',
  'portfolio.sub':
    'Vizuelni pravci iz naše radionice — pravi projekti stižu uskoro.',

  'proj.aurora.title': 'Aurora Studio',
  'proj.nordika.title': 'Nordika Shop',
  'proj.pulse.title': 'Pulse Analytics',
  'proj.terra.title': 'Terra Nekretnine',
  'proj.forma.title': 'Forma Gym',
  'proj.mono.title': 'Café Mono',

  'about.kicker': 'O nama',
  'about.title': 'Mali studio, visoka merila',
  'about.body':
    'Beverly Design vodi jednostavna ideja: svaki biznis zaslužuje sajt koji izgleda ozbiljno i radi besprekorno. Radimo blisko sa klijentima, od prve skice do lansiranja — bez šablona i bez kompromisa.',

  'stat.projects.label': 'Završenih projekata',
  'stat.clients.label': 'Zadovoljnih klijenata',
  'stat.years.label': 'Godina iskustva',
  'stat.reco.label': 'Klijenata nas preporučuje',

  'contact.kicker': 'Kontakt',
  'contact.title': 'Recite nam šta gradite',
  'contact.sub': 'Pišite nam — odgovaramo u roku od 24 časa.',
  'contact.copy': 'Kopiraj',
  'contact.copied': 'Kopirano!',
  'contact.copyAria': 'Kopiraj imejl adresu',
  'contact.mailto': 'Otvori u imejl aplikaciji',
  'contact.social': 'Pratite nas',

  'footer.rights': 'Sva prava zadržana.',
  'footer.backToTop': 'Nazad na vrh',
} as const;

const en = {
  'meta.title': 'Beverly Design — Web design & development studio',
  'meta.description':
    'We build fast, modern, unmistakable websites that bring your business clients.',

  'skip': 'Skip to content',

  'nav.services': 'Services',
  'nav.portfolio': 'Portfolio',
  'nav.about': 'About',
  'nav.contact': 'Contact',

  'toggle.label.sr': 'Switch to Serbian',
  'toggle.label.en': 'Switch to English',
  'toggle.announce': 'Language changed to English',

  'hero.eyebrow': 'Web design & development studio',
  'hero.title.pre': 'Websites that',
  'hero.title.accent': 'win you clients',
  'hero.sub':
    'From first sketch to launch — we design and build fast, modern websites that work for your business.',
  'hero.cta': 'Start a project',

  'services.kicker': 'Services',
  'services.title': 'What we do',
  'services.sub': 'Four things, done properly.',

  'svc.design.title': 'Web design',
  'svc.design.desc':
    'Design led by content and conversion — clean, contemporary, true to your brand.',
  'svc.dev.title': 'Web development',
  'svc.dev.desc':
    'Fast, reliable websites built with modern tooling and clean code.',
  'svc.brand.title': 'Branding',
  'svc.brand.desc':
    'An identity people remember: logo, color, typography and tone of voice.',
  'svc.seo.title': 'SEO & performance',
  'svc.seo.desc':
    'Technically sound sites search engines love and visitors stay on.',

  'portfolio.kicker': 'Portfolio',
  'portfolio.title': 'Selected work',
  'portfolio.sub': 'Visual directions from our studio — real projects coming soon.',

  'proj.aurora.title': 'Aurora Studio',
  'proj.nordika.title': 'Nordika Shop',
  'proj.pulse.title': 'Pulse Analytics',
  'proj.terra.title': 'Terra Estates',
  'proj.forma.title': 'Forma Gym',
  'proj.mono.title': 'Café Mono',

  'about.kicker': 'About',
  'about.title': 'A small studio with high standards',
  'about.body':
    'Beverly Design runs on a simple idea: every business deserves a website that looks serious and works flawlessly. We work closely with clients from first sketch to launch — no templates, no compromises.',

  'stat.projects.label': 'Projects delivered',
  'stat.clients.label': 'Happy clients',
  'stat.years.label': 'Years of experience',
  'stat.reco.label': 'Clients recommend us',

  'contact.kicker': 'Contact',
  'contact.title': "Tell us what you're building",
  'contact.sub': 'Write to us — we reply within 24 hours.',
  'contact.copy': 'Copy',
  'contact.copied': 'Copied!',
  'contact.copyAria': 'Copy email address',
  'contact.mailto': 'Open in your email app',
  'contact.social': 'Follow us',

  'footer.rights': 'All rights reserved.',
  'footer.backToTop': 'Back to top',
} satisfies Record<keyof typeof sr, string>;

export const dictionaries: Record<Locale, Dictionary> = { sr, en };

export function t(dict: Dictionary, key: string): string {
  return dict[key] ?? key;
}
