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
    // важливо для ngrok, інакше /auth/me інколи віддає HTML-інтерстішл
    config.headers["ngrok-skip-browser-warning"] = "true";
    if (!config.headers.Accept) config.headers.Accept = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (res) => {
    // Підстрахуємося: якщо прийшов рядок (через text/html), спробуємо розпарсити JSON
    if (typeof res.data === "string") {
      try {
        res.data = JSON.parse(res.data);
      } catch {
        /* ignore non-JSON */ void 0;
      }
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      store?.dispatch({ type: "auth/logout" });
    }
    return Promise.reject(error);
  }
);

export default instance;
