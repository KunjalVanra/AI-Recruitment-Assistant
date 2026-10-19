import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Automatically send JWT token with every request
api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");

  if (user) {
    try {
      const userData = JSON.parse(user);

      if (userData.access_token) {
        config.headers.Authorization = `Bearer ${userData.access_token}`;
      }
    } catch (error) {
      console.error("Invalid user data in localStorage");
    }
  }

  return config;
});

export default api;