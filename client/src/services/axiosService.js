import axios from "../store/axios";

export const apiService = {
  get: async (url) => axios.get(url),
  post: async (url, data) => axios.post(url, data),
  put: async (url, data) => axios.put(url, data),
  patch: async (url, data) => axios.patch(url, data),
  delete: async (url) => axios.delete(url),
};
