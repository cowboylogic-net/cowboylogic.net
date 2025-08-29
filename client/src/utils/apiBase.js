export const getApiBase = () => {
  // 1) <meta name="api-base" content="..."> має пріоритет
  if (typeof document !== "undefined") {
    const meta = document.querySelector('meta[name="api-base"]')?.content?.trim();
    if (meta) return meta.replace(/\/+$/, "");
  }

  // 2) .env завжди використовуємо як є (універсально для будь-якого бекенду)
  const env = import.meta.env?.VITE_API_URL?.trim();
  if (env) return env.replace(/\/+$/, "");

  // 3) інакше — без бази (відносні шляхи)
  return "";
};
