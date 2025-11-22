/**
 * i18n Configuration
 * Urdu + English support with RTL
 */

export const locales = ['en', 'ur'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ur: 'اردو',
};

export const rtlLocales: Locale[] = ['ur'];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

