import fs from "fs";
import path from "path";

// Створюємо шлях до лог-файлу
const logFilePath = path.resolve("server/logs/superadmin.log");

// Створюємо папку logs, якщо не існує
if (!fs.existsSync("server/logs")) {
  fs.mkdirSync("server/logs", { recursive: true });
}

// Функція логування
export const logSuperAdminAction = (adminEmail, action, target = "") => {
  const timestamp = new Date().toISOString();
  const cleanTarget = target || "N/A";
  const logLine = `[${timestamp}] SuperAdmin: ${adminEmail} performed "${action}" on ${cleanTarget}\n`;
  fs.appendFileSync(logFilePath, logLine);
};

export const logWarn = (...args) => {
  console.warn(...args);
};

export const logError = (...args) => {
  console.error(...args);
};
