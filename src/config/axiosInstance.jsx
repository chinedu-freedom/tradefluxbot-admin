"use client";

import axios from "axios";
import { CookieManager } from "@/utils/cookie-utils";

// Determine base API URL dynamically based on environment and hostname
export const getBaseApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("tradefluxbot.com")) {
      return "https://api.tradefluxbot.com/api";
    }
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    }
  }
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.tradefluxbot.com/api";
};

export const API_URL = getBaseApiUrl();

const axiosInstance = axios.create({
  baseURL: API_URL,
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      if (window.location.hostname.includes("tradefluxbot.com")) {
        config.baseURL = "https://api.tradefluxbot.com/api";
      }
      const token = CookieManager.get("sec-admin-token");
      if (token) {
        config.headers.Authorization = "Bearer " + token;
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
