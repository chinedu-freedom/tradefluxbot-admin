"use client";

import axios from "axios";
import { CookieManager } from "@/utils/cookie-utils";

// ✅ Use correct env variable
export const API_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://tradefluxbot-backend-5gbk.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = CookieManager.get("sec-admin-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if ((error?.response?.status === 401 || error?.response?.status === 403) && typeof window !== "undefined") {
      const isLoginRequest = error.config?.url?.includes('/auth/admin/login') || error.config?.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        // Clear all auth-related cookies
        CookieManager.remove("sec-admin-token");
        CookieManager.remove("isAuthenticated");
        
        // Redirect to login
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
