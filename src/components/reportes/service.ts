// src/components/reportes/service.ts
import { api } from "@/libs/api";

// Resultado genérico para cualquier petición
export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; locked: boolean; message: string };

// Estructura esperada de un error de Axios
interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
}

async function parseErrorAxios(e: unknown): Promise<{ status?: number; message: string }> {
  const error = e as AxiosErrorResponse;
  const status = error.response?.status;
  const body = error.response?.data;
  const msg = Array.isArray(body?.message)
    ? body?.message.join(". ")
    : body?.message;
  return { status, message: msg || "No se pudo completar la solicitud." };
}

// Tipos de los parámetros de búsqueda
interface ClasificadosResumenParams {
  id_area?: number;
  id_nivel?: number;
}

interface ClasificadosListaParams extends ClasificadosResumenParams {
  estado?: string;
}

// Tipos de los datos que esperas del backend (ajústalos según tu API)
export interface ClasificadoResumen {
  area: string;
  nivel: string;
  cantidad: number;
}

export interface ClasificadoItem {
  id: number;
  nombre: string;
  area: string;
  nivel: string;
  estado: string;
}

// Función para obtener resumen de clasificados
export async function getClasificadosResumen(
  params?: ClasificadosResumenParams
): Promise<FetchResult<ClasificadoResumen[]>> {
  try {
    const { data } = await api.get<ClasificadoResumen[]>("/reportes/clasificados/resumen", { params });
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}

// Función para obtener lista de clasificados
export async function getClasificadosLista(
  params?: ClasificadosListaParams
): Promise<FetchResult<ClasificadoItem[]>> {
  try {
    const { data } = await api.get<ClasificadoItem[]>("/reportes/clasificados", { params });
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}
