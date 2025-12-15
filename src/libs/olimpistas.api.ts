// src/libs/olimpistas.api.ts
import { api } from "@/libs/api";
import type { AreaCounter, OlimpistaRow } from "@/types/olimpista";


 // CONTADORES POR ÁREA
export async function fetchAreaCounters(): Promise<AreaCounter[]> {
  try {
    const { data } = await api.get<AreaCounter[]>("/olimpistas/areas-counters");
    return data;
  } catch {
    const [{ data: areas }, { data: all }] = await Promise.all([
      api.get<{ id_area: number; nombre_area: string }[]>("/areas"),
      api.get<OlimpistaRow[]>("/olimpistas"),
    ]);
    const counters = new Map<string, number>();
    for (const a of areas) counters.set(a.nombre_area, 0);
    for (const o of all) counters.set(o.area, (counters.get(o.area) || 0) + 1);
    return Array.from(counters.entries()).map(([nombre_area, total]) => ({
      nombre_area,
      total,
    }));
  }
}


 // Áreas disponibles (para filtros del front)

export async function fetchAvailableAreas(): Promise<string[]> {
  try {
    const { data } = await api.get<{ nombre_area: string }[]>("/areas/nombres");
    return data.map((a) => a.nombre_area);
  } catch {
    const { data } = await api.get<{ id_area: number; nombre_area: string }[]>(
      "/areas",
    );
    return data.map((a) => a.nombre_area);
  }
}


 // LISTADO OLIMPISTAS (ACTUAL)

export async function fetchOlimpistas(params?: { area?: string; q?: string }) {
  const { area, q } = params || {};
  const { data } = await api.get<OlimpistaRow[]>("/olimpistas", {
    params: { area, q },
  });
  return data;
}

 // CSV: VALIDACIÓN / IMPORT
 
export type CsvSummary = {
  total: number;
  ok: number;
  createdInsc?: number;
  skippedInsc?: number;
  errors: string[];
};

export async function validateCsvOlimpistas(file: File): Promise<CsvSummary> {
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await api.post<CsvSummary>("/olimpistas/register", fd, {
    params: { dryRun: true },
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function importCsvOlimpistas(file: File): Promise<CsvSummary> {
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await api.post<CsvSummary>("/olimpistas/register", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}


 // HISTORIAL POR GESTIÓN (CERRADA)

export async function fetchOlimpistasByGestion(
  idGestion: number,
  params?: { area?: string; q?: string },
) {
  const { area, q } = params || {};
  const { data } = await api.get<{ olimpistas: OlimpistaRow[] }>(
    `/gestiones/${idGestion}/olimpistas`,
    { params: { area, q } },
  );
  return data.olimpistas;
}

export async function fetchOlimpistasAreasByGestion(idGestion: number) {
  const { data } = await api.get<{ areas: string[] }>(
    `/gestiones/${idGestion}/olimpistas-areas`,
  );
  return data.areas;
}

export async function fetchOlimpistasClasificadosByGestion(
  idGestion: number,
  params?: { area?: string; q?: string },
) {
  const { area, q } = params || {};
  const { data } = await api.get<{ olimpistas: OlimpistaRow[] }>(
    `/gestiones/${idGestion}/olimpistas-clasificados`,
    { params: { area, q } },
  );
  return data.olimpistas;
}

export type OlimpistaFinalistaRow = OlimpistaRow & {
  medalla?: "ORO" | "PLATA" | "BRONCE" | "MENCION" | null;
};

export async function fetchOlimpistasFinalistasByGestion(
  idGestion: number,
  params?: { area?: string; q?: string },
) {
  const { area, q } = params || {};
  const { data } = await api.get<{ olimpistas: OlimpistaFinalistaRow[] }>(
    `/gestiones/${idGestion}/olimpistas-finalistas`,
    { params: { area, q } },
  );
  return data.olimpistas;
}
