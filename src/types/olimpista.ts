// src/types/olimpista.ts
export type OlimpistaRow = {
  id: number;
  nombreCompleto: string;
  area: string;
  nivel: string;
  puntuacion: number | null;
  unidadEducativa: string;
  departamento: string;
};

export type AreaCounter = {
  nombre_area: string;
  total: number; 
};
