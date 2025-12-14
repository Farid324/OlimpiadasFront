// src/components/controlFases/types.ts

export type AccionColor = 'primary' | 'neutral' | 'success';
export type EstadoUI = 'En progreso' | 'Listo para aprobar' | 'Completado';
export type FaseActual = 'Clasificación' | 'Evaluación Final' | 'Completado';

export interface FilaFase {
  id: number | string;

  // Opcionales para el modal / navegación
  idArea?: number | string;
  idNivel?: number | string;

  area: string;
  nivel: string;
  faseActual: FaseActual;

  progresoHecho: number;
  progresoTotal: number;

  resumen?: {
    clasificados?: number;
    noClasificados?: number;
    descalificados?: number;
    noEvaluados?: number;
  };

  responsable?: string;
  fechaHora?: string;
  estado: EstadoUI;

  accionLabel?: string;
  accionColor?: AccionColor;
  accionDisabled?: boolean;
}

export interface KPIs {
  evaluacionesCompletadas: { valor: number; total: number };
  fasesCompletadas: { valor: number; total: number };
  aprobacionesPendientes: { valor: number; nota?: string };
  progresoGeneral: { porcentaje: number; nota?: string };
}

export interface ControlFasesResponse {
  kpis: KPIs;
  filas: FilaFase[];
}
