// src/components/reportes/ceremonia.service.ts
import { api } from '@/libs/api';

export type Premio = 'ORO' | 'PLATA' | 'BRONCE' | 'MENCION';

export type CeremoniaResumen = {
  oro: number;
  plata: number;
  bronce: number;
  mencion: number;
  total: number;
};

export type CeremoniaItem = {
  area: string;
  nivel: string;
  anio: number;
  premio: Premio;
  ci: string | null;
  competidor: string;
};

export type CeremoniaFilters = {
  id_area?: number;
  id_nivel?: number;
  anio?: number;
  q?: string;
};

// Normaliza params: quita null/undefined/0
const toParams = (p: CeremoniaFilters = {}) => {
  const out: Record<string, string | number> = {};
  if (p.id_area && Number(p.id_area) !== 0) out.id_area = Number(p.id_area);
  if (p.id_nivel && Number(p.id_nivel) !== 0) out.id_nivel = Number(p.id_nivel);
  if (p.anio) out.anio = Number(p.anio);
  if (p.q) out.q = p.q;
  return out;
};

/** Resumen para cards (oro, plata, bronce, mención, total) */
export async function getCeremoniaResumen(params: CeremoniaFilters = {}) {
  const { data } = await api.get<CeremoniaResumen>('/reportes/ceremonia/resumen', {
    params: toParams(params),
  });
  return data;
}

/** Lista JSON (si luego quieres un preview) */
export async function getCeremoniaLista(params: CeremoniaFilters = {}) {
  const { data } = await api.get<CeremoniaItem[]>('/reportes/ceremonia', {
    params: toParams(params),
  });
  return data;
}

/** Descarga el Excel de ceremonia */
export async function exportCeremoniaExcel(params: CeremoniaFilters = {}) {
  const clean = toParams(params);
  const res = await api.get<Blob>('/reportes/ceremonia/export', {
    params: clean,
    responseType: 'blob',
  });

  const ts = new Date();
  const hh = String(ts.getHours()).padStart(2, '0');
  const mm = String(ts.getMinutes()).padStart(2, '0');
  const ss = String(ts.getSeconds()).padStart(2, '0');
  const anio = (clean.anio as number) ?? ts.getFullYear();

  const filename = `ceremonia_${clean.id_area ?? 'todas'}_${clean.id_nivel ?? 'todos'}_${anio}_${hh}${mm}${ss}.xlsx`;

  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
