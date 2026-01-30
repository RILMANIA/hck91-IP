import axios from "axios";

export const cvApi = axios.create({
  baseURL: "https://hck91.emirhaikal.web.id",
});

// Add token to all requests automatically
cvApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
