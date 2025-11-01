import { api } from '@/libs/api';

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
  // 🔹 Registrar una nueva nota
  async registrarNota(payload: {
    idInscripcion: number;
    idUsuario: number;
    nota: number;
    descripcionConceptual?: string;
    etica?: string;
    observaciones?: string;
  }) {
    const { data } = await api.post('/admin/evaluaciones/registrar-nota', {
      idInscripcion: payload.idInscripcion,
      idEvaluador: payload.idUsuario, // backend espera este campo
      nota: payload.nota,
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
    filtro?: 'PENDIENTE' | 'EVALUADO' | 'TODOS';
  }) {
    const { data } = await api.get('/admin/evaluaciones/mis-competidores', {
      params,
    });
    return data;
  },
};
