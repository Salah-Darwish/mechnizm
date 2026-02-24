import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import arTranslations from "./ar";
import enTranslations from "./en";

i18n.use(initReactI18next).init({
  resources: {
    ...arTranslations,
    ...enTranslations,
  },
  lng: "ar", // default language (Arabic)
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
