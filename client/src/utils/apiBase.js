export const getApiBase = () => {
  if (typeof document !== "undefined") {
    const meta = document.querySelector('meta[name="api-base"]')?.content?.trim();
    if (meta) return meta.replace(/\/+$/, "");
  }

  const env = import.meta.env?.VITE_API_URL?.trim();
  // ігноруємо локальний хост у проді — тоді підемо по відносному шляху і спрацюють rewrites
  if (env && !/^https?:\/\/localhost(?::\d+)?$/i.test(env)) {
    return env.replace(/\/+$/, "");
  }
  return "";
};
