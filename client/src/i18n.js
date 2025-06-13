import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

import enLogin from "./locales/en/login.json"; // ✅ тепер з src
import esLogin from "./locales/es/login.json";


i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    ns: ["translation", "login"],
    defaultNS: "translation",

    // 🔥 Окремо передаємо preloaded login, але не як `resources`
    partialBundledLanguages: true,
    preload: ["en", "es"],

    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },

    // ✅ Додаємо login вручну після ініціалізації
    initImmediate: false,
  });

// ⬇️ Додаємо вручну login namespace
i18n.addResourceBundle("en", "login", enLogin, true, true);
i18n.addResourceBundle("es", "login", esLogin, true, true);

export default i18n;
