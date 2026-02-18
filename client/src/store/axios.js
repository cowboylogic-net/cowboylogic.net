// client/src/store/axios.js
import axios from "axios";
import { getApiBase } from "../utils/apiBase";
import { showNotification } from "./slices/notificationSlice";
import { logger } from "../utils/logger";

let store;
export const injectStore = (_store) => {
  store = _store;
};

const API_BASE = getApiBase();
const instance = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : "/api",
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : "/api",
  withCredentials: true,
});

const REFRESH_PATH = "/auth/refresh";
const SESSION_EXPIRED_TOAST_ID = "auth-session-expired";
let refreshPromise = null;
let sessionExpiredHandled = false;

const authLogger = {
  debug: (...args) => logger.debug("[auth][axios]", ...args),
  warn: (...args) => logger.warn("[auth][axios]", ...args),
};

const isRefreshRequest = (url) =>
  /\/auth\/refresh(?:\?|$)/.test(String(url || ""));

const markSessionExpiredOnce = () => {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;

  store?.dispatch({ type: "auth/sessionExpired" });
  store?.dispatch(
    showNotification({
      id: SESSION_EXPIRED_TOAST_ID,
      type: "error",
      message: "Session expired. Please log in again.",
    }),
  );

 };

const getRefreshToken = () => {
  if (refreshPromise) {
    authLogger.debug("Awaiting in-flight refresh request");
    return refreshPromise;
  }

  authLogger.debug("Starting refresh request");
  refreshPromise = refreshClient
    .post(REFRESH_PATH, null)
    .then(({ data }) => {
      const newToken = data?.data?.token || data?.token;
      if (!newToken) throw new Error("No token from /auth/refresh");

      store?.dispatch({
        type: "auth/refreshSession/fulfilled",
        payload: newToken,
      });
      sessionExpiredHandled = false;
      return newToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

instance.interceptors.request.use(
  (config) => {
    const token = store?.getState().auth.token;
    if (token) {
      sessionExpiredHandled = false;
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["ngrok-skip-browser-warning"] = "true";
    if (!config.headers.Accept) config.headers.Accept = "application/json";
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (res) => {
    if (typeof res.data === "string") {
      try {
        res.data = JSON.parse(res.data);
      } catch {
        /* ignore */
      }
    }
    return res;
  },
  async (error) => {
    const resp = error.response;
    const orig = error.config || {};
    if (!resp) return Promise.reject(error);

    const isRefreshCall = isRefreshRequest(orig.url);
    if (resp.status !== 401 || orig._retry || isRefreshCall || orig._skipAuth) {
      return Promise.reject(error);
    }

    try {
      const newToken = await getRefreshToken();
      orig._retry = true;
      orig.headers = orig.headers || {};
      orig.headers.Authorization = `Bearer ${newToken}`;
      return instance(orig);
    } catch {
      authLogger.warn("Refresh failed; clearing session");
      markSessionExpiredOnce();
      return Promise.reject(error);
    }
  },
);

export default instance;
