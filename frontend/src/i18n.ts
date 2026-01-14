/**
 * i18n Configuration for next-intl
 * Required for the [locale] routing to work
 */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
