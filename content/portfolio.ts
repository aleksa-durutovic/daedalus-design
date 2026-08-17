import type { ShowcaseItem } from '@/types/content';

/**
 * The showcase presents the four KINDS OF SITE the studio builds (not fake
 * client projects). One axis only — the visitor recognises their own
 * business and opens that window. Each entry pairs a playable mini-demo in
 * Portfolio.tsx with localized copy: who it's for, what's included, how the
 * work runs, and how long it takes.
 * Order tells a story: sell → book → establish → convert.
 */
export const showcase: ShowcaseItem[] = [
  {
    key: 'shop',
    titleKey: 'show.shop.title',
    descKey: 'show.shop.desc',
    tagKey: 'show.shop.tag',
    forKey: 'show.shop.for',
    featureKeys: ['show.shop.f1', 'show.shop.f2', 'show.shop.f3', 'show.shop.f4'],
    stepKeys: ['show.shop.s1', 'show.shop.s2', 'show.shop.s3'],
    timelineKey: 'show.shop.time',
  },
  {
    key: 'booking',
    titleKey: 'show.booking.title',
    descKey: 'show.booking.desc',
    tagKey: 'show.booking.tag',
    forKey: 'show.booking.for',
    featureKeys: ['show.booking.f1', 'show.booking.f2', 'show.booking.f3', 'show.booking.f4'],
    stepKeys: ['show.booking.s1', 'show.booking.s2', 'show.booking.s3'],
    timelineKey: 'show.booking.time',
  },
  {
    key: 'company',
    titleKey: 'show.company.title',
    descKey: 'show.company.desc',
    tagKey: 'show.company.tag',
    forKey: 'show.company.for',
    featureKeys: ['show.company.f1', 'show.company.f2', 'show.company.f3', 'show.company.f4'],
    stepKeys: ['show.company.s1', 'show.company.s2', 'show.company.s3'],
    timelineKey: 'show.company.time',
  },
  {
    key: 'landing',
    titleKey: 'show.landing.title',
    descKey: 'show.landing.desc',
    tagKey: 'show.landing.tag',
    forKey: 'show.landing.for',
    featureKeys: ['show.landing.f1', 'show.landing.f2', 'show.landing.f3', 'show.landing.f4'],
    stepKeys: ['show.landing.s1', 'show.landing.s2', 'show.landing.s3'],
    timelineKey: 'show.landing.time',
  },
];
