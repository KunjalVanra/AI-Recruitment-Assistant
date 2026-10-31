import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-recruitment-assistant-3bir.onrender.com",
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