export type Locale = 'sr' | 'en';

export type Dictionary = Record<string, string>;

export interface ServiceItem {
  icon: string;
  titleKey: string;
  descKey: string;
}

export type ShowcaseKey = 'shop' | 'booking' | 'company' | 'landing';

export interface ShowcaseItem {
  key: ShowcaseKey;
  titleKey: string;
  descKey: string;
  tagKey: string;
  /** Who this kind of site is for — shown at the top of the open window. */
  forKey: string;
  /** Four concrete things the client gets (i18n keys). */
  featureKeys: [string, string, string, string];
  /** Three process steps, each "Title — detail" (i18n keys). */
  stepKeys: [string, string, string];
  /** Typical delivery window. */
  timelineKey: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}
