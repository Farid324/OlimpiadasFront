import { api } from '@/libs/api';

export const evaluacionesService = {
  // 🔹 Obtener competidores del evaluador
  async getCompetidores() {
    const { data } = await api.get('/admin/evaluaciones/mis-competidores');
    return data;
  },
  async getResumenEvaluador() {
    const { data } = await api.get('/admin/evaluaciones/resumen');
    return data;
  },

  // 🔹 Registrar una nueva nota
  async registrarNota(payload: {
    idInscripcion: number;
    idUsuario: number; // usar number, no unknown
    nota: number;
    descripcionConceptual?: string;
    etica?: string;
    observaciones?: string;
  }) {
    const { data } = await api.post('/admin/evaluaciones/nota', {
      idInscripcion: payload.idInscripcion,
      idEvaluador: payload.idUsuario, // backend espera idEvaluador
      nota: payload.nota,
      descripcionConceptual: payload.descripcionConceptual,
      etica: payload.etica,
      observaciones: payload.observaciones,
    });
    return data;
  },

  // 🔹 Editar nota existente
  async editarNota(payload: {
    idEvaluacion: number;
    idUsuario: number; // usar number
    nuevaNota: number;
  }) {
    const { data } = await api.put('/admin/evaluaciones/nota', {
      idEvaluacion: payload.idEvaluacion,
      idUsuario: payload.idUsuario,
      nuevaNota: payload.nuevaNota,
    });
    return data;
  },

  // 🔹 Listar competidores con filtro
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
