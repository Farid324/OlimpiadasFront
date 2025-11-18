// src/components/reportes/service.ts
import { api } from "@/libs/api";
import axios, { AxiosError } from "axios";

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

interface ApiErrorResponse {
  message?: string;
}

function handleExportError(error: unknown): never {
  const defaultMessage = "No se pudo exportar.";

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const msg = error.response?.data?.message ?? defaultMessage;

    if (status === 423) {
      throw new Error(`LOCKED::${msg}`);
    }

    throw new Error(msg);
  }

  throw new Error(defaultMessage);
}

async function parseErrorAxios(
  e: unknown
): Promise<{ status?: number; message: string }> {
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
    const { data } = await api.get<ClasificadoResumen[]>(
      "/reportes/clasificados/resumen",
      { params }
    );
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
    const { data } = await api.get<ClasificadoItem[]>(
      "/reportes/clasificados",
      { params }
    );
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}

// ===== PREMIADOS =====

export interface PremiadoItem {
  id_inscripcion: number;
  posicion: number;
  nombreCompleto: string;
  premio: string;
  estadoPremio: "ORO" | "PLATA" | "BRONCE" | "MENCION";
  area: string;
  nivel: string;
  puntuacion: number;
  unidadEducativa: string;
  departamento: string;
}

export interface PremiadosResumen {
  oro: number;
  plata: number;
  bronce: number;
  menciones: number;
  totalPremiados: number;
}

interface PremiadosParams {
  id_area?: number;
  id_nivel?: number;
  estado?: "ORO" | "PLATA" | "BRONCE" | "MENCION" | "TODOS";
}

// Función para obtener lista de premiados
export async function getPremiadosLista(
  params?: PremiadosParams
): Promise<FetchResult<PremiadoItem[]>> {
  try {
    const { data } = await api.get<PremiadoItem[]>("/reportes/premiados", {
      params,
    });
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}

// Función para obtener resumen de premiados
export async function getPremiadosResumen(
  params?: PremiadosParams
): Promise<FetchResult<PremiadosResumen>> {
  try {
    const { data } = await api.get<PremiadosResumen>(
      "/reportes/premiados/resumen",
      { params }
    );
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}

export async function reorderPremiados(
  id_area: number,
  id_nivel: number,
  orden: Array<{ id_inscripcion: number; posicion: number }>
): Promise<FetchResult<{ ok: boolean }>> {
  try {
    const { data } = await api.post<{ ok: boolean }>(
      `/reportes/premiados/${id_area}/${id_nivel}/reordenar`,
      { orden }
    );
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}

export async function getPremiadosHistorial(
  id_area: number,
  id_nivel: number
): Promise<
  FetchResult<
    Array<{ id: number; fecha: string; autor: string; orden: unknown }>
  >
> {
  try {
    const { data } = await api.get<
      Array<{ id: number; fecha: string; autor: string; orden: unknown }>
    >(`/reportes/premiados/${id_area}/${id_nivel}/historial`);
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}

// si luego se expone export en el backend
export async function exportPremiados(params?: PremiadosParams): Promise<Blob> {
  const { data } = await api.get("/reportes/premiados/export", {
    params,
    responseType: "blob",
  });
  return data;
}

// ===== CERTIFICADOS =====
type CertParams = {
  id_area?: number;
  id_nivel?: number;
  anio?: number;
};

export async function exportCertificadosParticipacion(
  params?: CertParams
): Promise<Blob> {
  try {
    const { data } = await api.get<Blob>(
      "/reportes/certificados/participacion/export",
      {
        params,
        responseType: "blob",
      }
    );

    return data;
  } catch (error: unknown) {
    handleExportError(error);
  }
}

export async function exportCertificadosPremiados(
  params?: CertParams
): Promise<Blob> {
  try {
    const { data } = await api.get<Blob>(
      "/reportes/certificados/premiados/export",
      {
        params,
        responseType: "blob",
      }
    );

    return data;
  } catch (error: unknown) {
    handleExportError(error);
  }
}
