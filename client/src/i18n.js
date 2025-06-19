import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

import enLogin from "./locales/en/login.json";
import esLogin from "./locales/es/login.json"; // залишаємо, але не вмикаємо через supportedLngs

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en"], // ✅ тимчасово вимикає інші мови, включно з es
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    ns: ["translation", "login"],
    defaultNS: "translation",
    partialBundledLanguages: true,
    preload: ["en"], // можна залишити ["en"], бо es не використовується зараз
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    initImmediate: false,
  });

// ✅ login-namespace підключається вручну
i18n.addResourceBundle("en", "login", enLogin, true, true);
// es залишаємо підключеним на майбутнє
i18n.addResourceBundle("es", "login", esLogin, true, true);

export default i18n;
