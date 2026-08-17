import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const RTL_LANGUAGES: readonly SupportedLanguage[] = ['ar'];

const LANGUAGE_STORAGE_KEY = 'app-language';
const i18n = createInstance();

function isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

function detectDeviceLanguage(): SupportedLanguage {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? undefined;
  return isSupportedLanguage(deviceLanguage) ? deviceLanguage : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export async function loadPersistedLanguage(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored ?? undefined)) {
      await i18n.changeLanguage(stored as SupportedLanguage);
    }
  } catch {
    // Ignore, keep device-detected language.
  }
}

export async function setAppLanguage(language: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(language);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore persistence failure — selection still applies for this session.
  }
}

export default i18n;
