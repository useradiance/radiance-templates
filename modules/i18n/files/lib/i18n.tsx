import { getLocales } from 'expo-localization';
import i18n, { changeLanguage, use as withPlugin } from 'i18next';
import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import en from '@/locales/en.json';

export const DEFAULT_LOCALE = '{{radiance.defaultLocale}}';

export const resources = {
  en: { translation: en },
  // radiance:locales:start
  // radiance:locales:end
};

export const supportedLocales = Object.keys(resources);

/** Device locale if we ship translations for it, otherwise the default. */
export function resolveInitialLocale(): string {
  for (const locale of getLocales()) {
    const exact = locale.languageTag?.toLowerCase();
    const base = locale.languageCode?.toLowerCase();
    const match = supportedLocales.find(
      (supported) => supported.toLowerCase() === exact || supported.toLowerCase() === base,
    );
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

let initialized = false;

export function initI18n(): typeof i18n {
  if (initialized) return i18n;
  initialized = true;

  const lng = resolveInitialLocale();
  const isRTL = getLocales().some((locale) => locale.textDirection === 'rtl');

  // Layout direction must be decided before the first render; a real switch at runtime
  // still requires an app reload on native.
  I18nManager.allowRTL(isRTL);

  void withPlugin(initReactI18next).init({
    resources,
    lng,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: supportedLocales,
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

  return i18n;
}

export function changeLocale(locale: string): Promise<unknown> {
  return changeLanguage(locale);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(() => initI18n());
  const [ready, setReady] = useState(instance.isInitialized);

  useEffect(() => {
    if (ready) return;
    const onInitialized = () => setReady(true);
    instance.on('initialized', onInitialized);
    return () => instance.off('initialized', onInitialized);
  }, [instance, ready]);

  if (!ready) return null;

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
