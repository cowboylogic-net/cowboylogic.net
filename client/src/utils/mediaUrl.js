// client/src/utils/mediaUrl.js
import { getApiBase } from "./apiBase";

export const toAbsoluteMediaUrl = (u) => {
  if (!u || typeof u !== "string") return u;
  if (/^(https?:|blob:|data:)/i.test(u)) return u;  
  const base = getApiBase();
  const rel = u.startsWith("/") ? u : `/${u}`;
  return base ? `${base}${rel}` : rel;
};
