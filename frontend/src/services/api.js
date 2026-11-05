import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://ai-recruitment-assistant-3bir.onrender.com",
});

// Automatically send JWT token with every request
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");

    if (user) {
      try {
        const userData = JSON.parse(user);

        if (userData.access_token) {
          config.headers.Authorization = `Bearer ${userData.access_token}`;
        }
      } catch (error) {
        console.error("Invalid user data in localStorage", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling and 401 redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if already on login or register
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;