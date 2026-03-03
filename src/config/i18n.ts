import i18n from "i18next"
import { initReactI18next } from "../../node_modules/react-i18next"
import HttpBackend from "i18next-http-backend"
import LanguageDetector from "i18next-browser-languagedetector/cjs"

i18n
  .use(HttpBackend) // Load translations via HTTP
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en"],
    debug: process.env.NODE_ENV === "development",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
