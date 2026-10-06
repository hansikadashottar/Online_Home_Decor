import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
     * FormData ke case mein Content-Type manually set nahi karna hai.
     * Browser khud multipart/form-data + boundary set karega.
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    const publicAuthRequest =
      url.includes("/users/login") ||
      url === "/users" ||
      url.includes("/users/forgot-password") ||
      url.includes("/users/reset-password");

    if (status === 401 && !publicAuthRequest) {
      [
        "token",
        "role",
        "userId",
        "fullName",
        "email",
      ].forEach((key) =>
        localStorage.removeItem(key)
      );

      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

export default api;