import { createI18n } from 'vue-i18n';
import en from '@/locales/app/en.json';
import type { Locale } from '@/types';

export const SUPPORTED_LOCALES: Locale[] = ['en'];

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
});

export function getLocale(): Locale {
  return 'en';
}
