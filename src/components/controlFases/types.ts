export type FaseActual = 'Clasificación'|'Evaluación Final'|'Completado';
export type EstadoFila = 'En progreso'|'Completado'|'Listo para aprobar';

export type ResumenClasificacion = {
  clasificados: number;
  noClasificados: number;
  descalificados: number;
};

export type FilaFase = {
  id: string;
  area: string;
  nivel: string;
  faseActual: FaseActual;
  progresoHecho: number;
  progresoTotal: number;
  resumen: ResumenClasificacion;
  responsable: string;
  fechaHora: string;
  estado: EstadoFila;
  accionLabel?: string;
  accionColor?: 'primary'|'neutral'|'success';
  accionDisabled?: boolean;
};

export type KPIs = {
  evaluacionesCompletadas: { valor: number; total: number };
  fasesCompletadas: { valor: number; total: number };
  aprobacionesPendientes: { valor: number; nota?: string };
  progresoGeneral: { porcentaje: number; nota?: string };
};

export type ControlFasesResponse = {
  kpis: KPIs;
  filas: FilaFase[];
};
