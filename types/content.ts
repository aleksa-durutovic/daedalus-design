export type Locale = 'sr' | 'en';

export type Dictionary = Record<string, string>;

export interface ServiceItem {
  icon: string;
  titleKey: string;
  descKey: string;
}

export interface PortfolioItem {
  titleKey: string;
  variant: 'gradient' | 'svg';
  tag: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}
