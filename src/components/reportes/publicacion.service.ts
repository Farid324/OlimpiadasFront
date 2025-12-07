// src/services/publicacion.service.ts (o donde tengas tus servicios de API)
import { api } from '@/libs/api';

type PublicacionFilters = {
  id_area?: number;
  id_nivel?: number;
};

/**
 * Exporta el Excel de publicación
 */
export async function exportPublicacionExcel(filters?: PublicacionFilters): Promise<void> {
  const params = new URLSearchParams();
  
  if (filters?.id_area && filters.id_area > 0) {
    params.set('id_area', String(filters.id_area));
  }
  if (filters?.id_nivel && filters.id_nivel > 0) {
    params.set('id_nivel', String(filters.id_nivel));
  }

  const res = await api.get('/reportes/publicacion/export', {
    params: Object.fromEntries(params),
    responseType: 'blob',
  });

  const blob = res.data as Blob;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Nombre del archivo con filtros
  const ia = filters?.id_area ?? 'todas';
  const inv = filters?.id_nivel ?? 'todos';
  a.download = `publicacion_${ia}_${inv}.xlsx`;
  
  a.click();
  window.URL.revokeObjectURL(url);
}