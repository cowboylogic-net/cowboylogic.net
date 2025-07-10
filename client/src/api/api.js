import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = `${rawBase}/api`;

export const createApiClient = (token) => {
  const instance = axios.create({
    baseURL,
    withCredentials: false,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return instance;
};
