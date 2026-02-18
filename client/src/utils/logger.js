const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_LEVEL = import.meta.env.PROD ? "info" : "debug";
const configuredLevel = String(import.meta.env.VITE_LOG_LEVEL || DEFAULT_LEVEL)
  .toLowerCase()
  .trim();
const activeLevel = LEVELS[configuredLevel] ? configuredLevel : DEFAULT_LEVEL;

const shouldLog = (level) => {
  if (level === "debug" && import.meta.env.PROD) return false;
  return LEVELS[level] >= LEVELS[activeLevel];
};

const write = (level, args) => {
  if (!shouldLog(level)) return;
  const sink = console[level] || console.log;
  sink(...args);
};

export const logger = {
  debug: (...args) => write("debug", args),
  info: (...args) => write("info", args),
  warn: (...args) => write("warn", args),
  error: (...args) => write("error", args),
};

