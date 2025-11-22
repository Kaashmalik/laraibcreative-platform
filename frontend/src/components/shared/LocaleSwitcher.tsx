/**
 * Locale Switcher Component
 * Switch between English and Urdu
 */

'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { locales, localeNames } from '@/i18n/config';
import { Globe } from 'lucide-react';

export default function LocaleSwitcher() {
  const locale = useLocale() as 'en' | 'ur';
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: 'en' | 'ur') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value as 'en' | 'ur')}
        className="bg-transparent border-none outline-none cursor-pointer"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}

