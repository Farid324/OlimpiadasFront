// src/libs/olimpistas.api.ts
import { api } from "@/libs/api";
import type { AreaCounter, OlimpistaRow } from "@/types/olimpista";

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

export async function fetchOlimpistas(params?: { area?: string; q?: string }) {
  const { area, q } = params || {};
  const { data } = await api.get<OlimpistaRow[]>("/olimpistas", {
    params: { area, q },
  });
  return data;
}
