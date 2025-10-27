// src/components/reportes/service.ts
import { api } from "@/libs/api";

export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; locked: boolean; message: string };

async function parseErrorAxios(e: any) {
  const res = e?.response;
  const status = res?.status;
  const body = res?.data;
  const msg = Array.isArray(body?.message)
    ? body.message.join(". ")
    : body?.message;
  return { status, message: msg || "No se pudo completar la solicitud." };
}

export async function getClasificadosResumen(params?: {
  id_area?: number;
  id_nivel?: number;
}): Promise<FetchResult<any>> {
  try {
    const { data } = await api.get("/reportes/clasificados/resumen", {
      params,
    });
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}

export async function getClasificadosLista(params?: {
  id_area?: number;
  id_nivel?: number;
  estado?: string;
}): Promise<FetchResult<any>> {
  try {
    const { data } = await api.get("/reportes/clasificados", { params });
    return { ok: true, data };
  } catch (e) {
    const { status, message } = await parseErrorAxios(e);
    if (status === 423) return { ok: false, locked: true, message };
    return { ok: false, locked: false, message };
  }
}
