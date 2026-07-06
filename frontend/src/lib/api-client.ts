// vocab-practice/frontend/src/lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const authEndpointHints = ["/auth/login", "/auth/register"];

// Interceptor to add Bearer token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor to handle unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || "");
    const isAuthEndpoint = authEndpointHints.some((hint) => requestUrl.includes(hint));

    if (error.response?.status === 401 && !isAuthEndpoint) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
