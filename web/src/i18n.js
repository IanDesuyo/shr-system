import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import zh from "./Lang/zh.json";
import en from "./Lang/en.json";
import ja from "./Lang/ja.json";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  zh: { translation: zh },
  en: { translation: en },
  ja: { translation: ja },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "zh",
    supportedLngs: ["zh", "en", "ja"],
    detection: {
      order: ["querystring", "localStorage"],
      caches: ["localStorage"],
      lookupQuerystring: "lang",
      lookupLocalStorage: "Lang",
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
