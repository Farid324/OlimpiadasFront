import { api } from '@/libs/api';

export const evaluacionesService = {
  async getCompetidores() {
    const { data } = await api.get('/admin/evaluaciones/mis-competidores');
    return data;
  },

  async registrarNota(payload: {
    idInscripcion: number;
    nota: number;
    descripcionConceptual?: string;
    etica?: string;
    observaciones?: string;
  }) {
    const { data } = await api.post("/admin/evaluaciones/nota", payload);
    return data;
  },

  async editarNota(payload: {
    idEvaluacion: number;
    nuevaNota: number;
  }) {
    const { data } = await api.put("/admin/evaluaciones/nota", payload);
    return data;
  },
  async listarCompetidores(params: {
    search?: string;
    filtro?: "PENDIENTE" | "EVALUADO" | "TODOS";
  }) {
    const { data } = await api.get("/admin/evaluaciones/mis-competidores", {
      params,
    });
    return data;
  },
};
