import axios from "axios";
import { getApiBase } from "../utils/apiBase";

let store;
export const injectStore = (_store) => { store = _store; };

const API_BASE = getApiBase();
const instance = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : "/api",
  withCredentials: false,
});

instance.interceptors.request.use(
  (config) => {
    const token = store?.getState().auth.token || localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      store?.dispatch({ type: "auth/logout" });
    }
    return Promise.reject(error);
  }
);

export default instance;
