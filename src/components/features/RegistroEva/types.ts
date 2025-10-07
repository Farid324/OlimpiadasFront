// src/components/features/RegistroEva/types.ts

export type Area = { id_area: number; nombre_area: string };

export type Evaluador = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
  institucion?: string | null;
  especialidad?: string | null;
  experiencia?: number | null;
  activo?: boolean;
  evaluadores_area?: { area: Area }[];
};

export type Metrics = {
  total: number;
  activos: number;     // ← nuevo
  areasCubiertas: number;
  promExp: number;
};
