// src/types/grupo.ts

export type GrupoMiembroInput = {
  nombreCompleto: string;
  ci: string;
  tutorContacto?: string;
  departamento?: string;
  grado: number;
};

export type CreateGrupoInput = {
  nombreEquipo: string;
  unidadEducativa: string;
  departamento: string;
  area: string;
  nivelCompetencia?: "Primaria" | "Secundaria";
  nivel?: "Primaria" | "Secundaria";

  miembros: GrupoMiembroInput[];
  tutorId?: number;
  tutorTelefono?: string;
};
