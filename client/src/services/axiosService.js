import axios from "../store/axios"; 
import { getToken } from "./authHelpers"; 

// Додає Authorization заголовок автоматично
const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiService = {
  get: async (url, secured = false) =>
    axios.get(url, secured ? { headers: authHeaders() } : {}),

  post: async (url, data, secured = false) =>
    axios.post(url, data, secured ? { headers: authHeaders() } : {}),

  put: async (url, data, secured = false) =>
    axios.put(url, data, secured ? { headers: authHeaders() } : {}),

  patch: async (url, data, secured = false) =>
    axios.patch(url, data, secured ? { headers: authHeaders() } : {}),

  delete: async (url, secured = false) =>
    axios.delete(url, secured ? { headers: authHeaders() } : {}),
};
