// src/services/evaluaciones-service.ts
import { api } from '@/libs/api';
import { CompetidorInscripcionAdmin } from '@/types/notas';

export const evaluacionesService = {
  async listar(params?: { areaId?: number; nivelId?: number; search?: string; page?: number; limit?: number }) {
    const { data } = await api.get<CompetidorInscripcionAdmin[]>('/admin/evaluaciones/adminLista', { params });
    return data;
  },
  async stats(params?: { areaId?: number; nivelId?: number }) {
    const { data } = await api.get('/admin/evaluaciones/adminStats', { params });
    return data as { total: number; completadas: number; enProceso: number; pendientes: number };
  },
  async areas() {
    const { data } = await api.get('/admin/evaluaciones/areas');
    return data;
  },
  async niveles() {
    const { data } = await api.get('/admin/evaluaciones/niveles');
    return data;
  },
  async getEvaluacion(id: number) {
    const { data } = await api.get(`/admin/evaluaciones/${id}`);
    return data;
  },
};
