import { getApiBase } from "./apiBase";

export const toAbsoluteMediaUrl = (u) => {
  if (typeof u !== "string") return "";
  const raw = u.trim();
  if (!raw) return "";

  if (/^(https?:\/\/|blob:|data:)/i.test(raw)) return raw;

  const path = raw.startsWith("uploads/") ? `/${raw}` : raw;

  if (path.startsWith("/uploads/")) {
    const base = getApiBase();
    if (!base) return path;
    const normalizedBase = String(base).replace(/\/+$/, "");
    return `${normalizedBase}${path}`;
  }

  if (path.startsWith("/")) return path;

  return "";
};
