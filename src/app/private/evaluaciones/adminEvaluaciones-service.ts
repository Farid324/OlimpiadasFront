import { api } from '@/libs/api';
import { CompetidorInscripcionAdmin } from '@/types/notas';

// 🔹 Tipo reutilizable para filtros
export interface Filters {
  areaId?: number;
  nivelId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// 🔹 Tipo para estadísticas
export interface Stats {
  total: number;
  completadas: number;
  enProceso: number;
  pendientes: number;
}

export const evaluacionesService = {
  // 🔸 Listar evaluaciones por fase
  async listar(fase: 1 | 2, params?: Filters) {
    const url =
      fase === 1
        ? '/admin/evaluaciones/adminLista'
        : '/admin/evaluaciones/adminListaFinal';
    try {
      const { data } = await api.get<CompetidorInscripcionAdmin[]>(url, {
        params,
      });
      return data;
    } catch (err) {
      console.error(`Error listando evaluaciones fase ${fase}:`, err);
      return [];
    }
  },

  // 🔸 Estadísticas por fase
  async stats(fase: 1 | 2, params?: Filters) {
    const url =
      fase === 1
        ? '/admin/evaluaciones/adminStats'
        : '/admin/evaluaciones/adminStatsFinales';
    try {
      const { data } = await api.get<Stats>(url, { params });
      return data;
    } catch (err) {
      console.error(`Error obteniendo stats fase ${fase}:`, err);
      return { total: 0, completadas: 0, enProceso: 0, pendientes: 0 };
    }
  },

  // 🔸 Obtener detalle de evaluación (fase 1 o 2)
  async getEvaluacion(id: number, fase: 1 | 2 = 1) {
    const url =
      fase === 1
        ? `/admin/evaluaciones/${id}`
        : `/admin/evaluaciones/fase-dos/${id}`;
    const { data } = await api.get(url);
    return data;
  },

  // 🔸 Áreas y niveles
  async areas() {
    const { data } = await api.get('/admin/evaluaciones/areas');
    return data;
  },
  async niveles() {
    const { data } = await api.get('/admin/evaluaciones/niveles');
    return data;
  },
};
