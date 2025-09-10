// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Refresh token flow removed. We only use access tokens now.

// Attach token before request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s by clearing token and redirecting to login
api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      if (!originalRequest.url.includes('/login')) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


export default api;
