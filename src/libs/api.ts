// src/libs/api.ts
import axios from 'axios';
import { env } from '@/config/env';

export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});