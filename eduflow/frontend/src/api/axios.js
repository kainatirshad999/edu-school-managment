import axios from "axios";

const api = axios.create({
  baseURL: "https://edu-school-managment-ginw.vercel.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eduflow_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("eduflow_token");
      localStorage.removeItem("eduflow_user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;