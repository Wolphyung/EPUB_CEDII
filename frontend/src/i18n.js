import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importez les traductions (Assurez-vous que les chemins sont corrects)
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  }
};

i18n
  .use(LanguageDetector) 
  .use(initReactI18next) 
  .init({
    resources,
    // Langue par défaut
    fallbackLng: 'fr', 
    defaultNS: 'translation',

    interpolation: {
      escapeValue: false,
    },
    detection: {
        order: ['cookie', 'localStorage', 'navigator'],
    }
  });

export default i18n;