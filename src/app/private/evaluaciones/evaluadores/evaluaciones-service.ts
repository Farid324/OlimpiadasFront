//src/app/private/evaluaciones/evaluadores/evaluaciones-service.ts

import { api } from '@/libs/api';

export type FiltroEstado = 'PENDIENTE' | 'EVALUADO' | 'TODOS';

export const evaluacionesService = {
  async getResumenEvaluador() {
    const { data } = await api.get('/admin/evaluaciones/resumen');
    return data;
  },

  async registrarNota(payload: {
    idInscripcion: number;
    idUsuario: number;
    nota: number;
    idFase: 1 | 2,
    descripConceptual?: string;
    comentario?: string;
  }) {
    console.log(' Registrar nota payload:', payload);
    const { data } = await api.post('/admin/evaluaciones/registrar-nota', {
      idInscripcion: payload.idInscripcion,
      idEvaluador: payload.idUsuario,
      nota: payload.nota,
      idFase: payload.idFase,
      descripConceptual: payload.descripConceptual ?? null,
      comentario: payload.comentario ?? null,
    });
    return data;
  },

  async editarNota(payload: {
    idEvaluacion: number;
    idUsuario: number;
    nuevaNota: number;
    idFase: 1 | 2,
    descripConceptual?: string;
    comentario?: string;
  }) {
    console.log(' Editar nota payload:', payload);
    const { data } = await api.put('/admin/evaluaciones/editar-nota', {
      idEvaluacion: payload.idEvaluacion,
      idUsuario: payload.idUsuario,
      nuevaNota: payload.nuevaNota,
      idFase: payload.idFase,
      descripConceptual: payload.descripConceptual ?? null,
      comentario: payload.comentario ?? null,
    });
    return data;
  },

  async listarCompetidores(params: {
    search?: string;
    filtro?: FiltroEstado;
    id_area?: number; 
    id_nivel?: number;  
    idAreas: number[]; 
  }) {
    const qp: Record<string, unknown> = {};
    if (params?.search) qp.search = params.search;
    if (params?.filtro && params.filtro !== 'TODOS') qp.filtro = params.filtro;

    if (typeof params?.id_area === 'number' && params.id_area > 0) {
      qp.id_area = params.id_area;
    }
    if (typeof params?.id_nivel === 'number' && params.id_nivel > 0) {
      qp.id_nivel = params.id_nivel;
    }

    const { data } = await api.get('/admin/evaluaciones/mis-competidores', {
      params: qp,
    });
    return data;
  },

  async getListarCompetidoresClasificados(params?: {
    search?: string;
    id_area?: number;
    id_nivel?: number;
    idAreas: number[]; 
  }) {
    const qp: Record<string, unknown> = {};
    if (params?.search) qp.search = params.search;
    if (typeof params?.id_area === 'number' && params.id_area > 0) {
      qp.id_area = params.id_area;
    }
    if (typeof params?.id_nivel === 'number' && params.id_nivel > 0) {
      qp.id_nivel = params.id_nivel;
    }
    const { data } = await api.get(
      '/admin/evaluaciones/listarCompetidoresFirmados',
      { params: qp },
    );
    return data;
  },

  async getEvaluacion(id: number, fase: 1 | 2 = 1) {
    const url =
      fase === 1
        ? `/admin/evaluaciones/${id}`
        : `/admin/evaluaciones/fase-dos/${id}`;
    const { data } = await api.get(url);
    return data;
  },
};
