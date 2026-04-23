import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import jp from './locales/jp.json';

export const SUPPORTED_LANGS = ['ko', 'jp'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = 'ko';

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    jp: { translation: jp },
  },
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
});

export default i18n;
