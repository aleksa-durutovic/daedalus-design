import { cookies } from 'next/headers';
import type { Locale } from '@/types/content';

export const LOCALE_COOKIE = 'locale';
export const DEFAULT_LOCALE: Locale = 'sr';
export const LOCALES: readonly Locale[] = ['sr', 'en'];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Server-only: reads the locale cookie, validates it, defaults to 'sr'. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
