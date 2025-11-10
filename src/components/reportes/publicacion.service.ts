// src/components/reportes/publicacion.service.ts
import { api } from '@/libs/api';
import { PublicacionFilters } from '@/types/principal'; // Importará de tu archivo de tipos

// (Esta función es idéntica, solo cambia el tipo)
// Normaliza params: quita null/undefined/0
const toParams = (p: PublicacionFilters = {}) => {
  const out: Record<string, string | number> = {};
  if (p.id_area && Number(p.id_area) !== 0) out.id_area = Number(p.id_area);
  if (p.id_nivel && Number(p.id_nivel) !== 0) out.id_nivel = Number(p.id_nivel);
  if (p.anio) out.anio = Number(p.anio);
  // 'q' (search) no es necesario para tu pestaña
  return out;
};

/** Descarga el Excel de Publicación (Clasificados) */
export async function exportPublicacionExcel(params: PublicacionFilters = {}) {
  const clean = toParams(params);
  
  // CAMBIO 1: Apunta al nuevo endpoint del backend
  const res = await api.get<Blob>('/reportes/publicacion/export', {
    params: clean,
    responseType: 'blob',
  });

  // El resto es la misma lógica de descarga
  const ts = new Date();
  const hh = String(ts.getHours()).padStart(2, '0');
  const mm = String(ts.getMinutes()).padStart(2, '0');
  const ss = String(ts.getSeconds()).padStart(2, '0');
  const anio = (clean.anio as number) ?? ts.getFullYear();

  // CAMBIO 2: Cambia el nombre del archivo
  const filename = `publicacion_${clean.id_area ?? 'todas'}_${
    clean.id_nivel ?? 'todos'
  }_${anio}_${hh}${mm}${ss}.xlsx`;

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