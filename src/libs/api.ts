// src/libs/api.ts
import axios from "axios";
import { env } from "@/config/env";

export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: false,
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);
