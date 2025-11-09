//src/app/private/evaluaciones/evaluadores/evaluaciones-service.ts

import { api } from '@/libs/api';

export type FiltroEstado = 'PENDIENTE' | 'EVALUADO' | 'TODOS';

export const evaluacionesService = {
  // ==========================================================
  // 🔹 Obtener competidores del evaluador
  // ==========================================================
  async getCompetidores() {
    const { data } = await api.get('/admin/evaluaciones/mis-competidores');
    return data;
  },

  // ==========================================================
  // 🔹 Obtener resumen general del evaluador
  // ==========================================================
  async getResumenEvaluador() {
    const { data } = await api.get('/admin/evaluaciones/resumen');
    return data;
  },

  // ==========================================================
  // 🔹 Registrar una nueva nota
  // ==========================================================
  async registrarNota(payload: {
    idInscripcion: number;
    idUsuario: number;
    nota: number;
    idFase: 1 | 2,
    descripcionConceptual?: string;
    etica?: string;
    observaciones?: string;
  }) {
    const { data } = await api.post('/admin/evaluaciones/registrar-nota', {
      idInscripcion: payload.idInscripcion,
      idEvaluador: payload.idUsuario,            // backend espera este campo
      nota: payload.nota,
      idFase: payload.idFase,
      comentario: payload.observaciones ?? null, // backend espera 'comentario'
    });
    return data;
  },

  // 🔹 Editar nota existente
  async editarNota(payload: {
    idEvaluacion: number;
    idUsuario: number;
    nuevaNota: number;
    descripcionConceptual?: string;
    etica?: string;
    observaciones?: string;
  }) {
    const { data } = await api.put('/admin/evaluaciones/editar-nota', {
      idEvaluacion: payload.idEvaluacion,
      idUsuario: payload.idUsuario,
      nuevaNota: payload.nuevaNota,
      comentario: payload.observaciones ?? null,
    });
    return data;
  },

  // ==========================================================
  // 🔹 Listar competidores con filtro y búsqueda
  // ==========================================================
  async listarCompetidores(params: {
    search?: string;
    filtro?: FiltroEstado;
    id_area?: number;   // puede venir 0, null o undefined desde el UI
    id_nivel?: number;  // idem
  }) {
    // Normaliza para no enviar 0/null y así evitar “falso filtro”
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
  // ==========================================================
// 🔹 Listar competidores clasificados con evaluaciones firmadas
// ==========================================================
async getListarCompetidoresClasificados(params?: {
  search?: string;
  id_area?: number;
  id_nivel?: number;
}) {
  // Normalizamos los parámetros para evitar enviar valores vacíos
  const qp: Record<string, unknown> = {};
  if (params?.search) qp.search = params.search;
  if (typeof params?.id_area === 'number' && params.id_area > 0) {
    qp.id_area = params.id_area;
  }
  if (typeof params?.id_nivel === 'number' && params.id_nivel > 0) {
    qp.id_nivel = params.id_nivel;
  }

  // 🔹 Llamada al nuevo endpoint del backend
  const { data } = await api.get(
    '/admin/evaluaciones/listarCompetidoresFirmados',
    { params: qp },
  );
  return data;
},

};
