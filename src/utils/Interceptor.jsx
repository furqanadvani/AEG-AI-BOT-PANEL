import axios from "axios";
import { store } from "../store";
import { logout } from "../store/actions/Auth.action";
import { API_URL, TOKEN } from "./Constants";

// Login / forgot / reset par 401 ka matlab "ghalat password" hai, session expire nahi
const PUBLIC_PATHS = ["auth/login", "auth/forgot-password", "auth/reset-password"];

const setupInterceptor = () => {
  axios.defaults.baseURL = API_URL;

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = error?.config?.url || "";
      const isPublic = PUBLIC_PATHS.some((p) => url.includes(p));
      if (error?.response?.status === 401 && !isPublic) {
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
};

export { setupInterceptor };
