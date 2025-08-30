// client/src/store/axios.js
import axios from "axios";
import { getApiBase } from "../utils/apiBase";

let store;
export const injectStore = (_store) => {
  store = _store;
};

const API_BASE = getApiBase();
const instance = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : "/api",
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = store?.getState().auth.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["ngrok-skip-browser-warning"] = "true";
    if (!config.headers.Accept) config.headers.Accept = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Auto-refresh on 401 (single-flight) ----
let isRefreshing = false;
let refreshPromise = null;

instance.interceptors.response.use(
  (res) => {
    if (typeof res.data === "string") {
      try { res.data = JSON.parse(res.data); } catch { /* ignore */ }
    }
    return res;
  },
  async (error) => {
    const resp = error.response;
    const orig = error.config || {};
    if (!resp) return Promise.reject(error);

    const isRefreshCall = String(orig.url || "").endsWith("/auth/refresh");
    if (resp.status !== 401 || orig._retry || isRefreshCall || orig._skipAuth) {
      return Promise.reject(error);
    }

    orig._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = instance.post("/auth/refresh", null, { _skipAuth: true });
      }
      const { data } = await refreshPromise;
      const newToken = data?.data?.token || data?.token;
      if (!newToken) throw new Error("No token from /auth/refresh");

      store?.dispatch({
        type: "auth/refreshSession/fulfilled",
        payload: newToken,
      });

      isRefreshing = false;
      refreshPromise = null;

      orig.headers = orig.headers || {};
      orig.headers.Authorization = `Bearer ${newToken}`;
      return instance(orig);
    } catch (e) {
      isRefreshing = false;
      refreshPromise = null;
      store?.dispatch({ type: "auth/logout" });
      return Promise.reject(e);
    }
  }
);

export default instance;
