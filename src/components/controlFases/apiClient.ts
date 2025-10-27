// src/components/controlFases/apiClient.ts
// Usa el axios api central que ya inyecta el Bearer desde localStorage
import { api } from "@/libs/api";

export async function getFromAPI<T>(path: string): Promise<T> {
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  const { data } = await api.get<T>(fullPath);
  return data;
}

export async function postToAPI<T, B = unknown>(path: string, body?: B): Promise<T> {
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  const { data } = await api.post<T>(fullPath, body);
  return data;
}
