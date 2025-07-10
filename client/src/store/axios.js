import axios from "axios";
import { store } from "./store";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: false,
});

// Додаємо токен з Redux у заголовки
instance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// (необов’язково) Автоматичний logout при 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch({ type: "auth/logoutUser/fulfilled" });
    }
    return Promise.reject(error);
  }
);

export default instance;
