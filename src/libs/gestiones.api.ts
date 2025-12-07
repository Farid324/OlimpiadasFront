// src/libs/gestiones.api.ts
import { api } from "@/libs/api";

export type EstadoGestion = "ABIERTA" | "CERRADA";

export type Gestion = {
  id_gestion: number;
  anio: number;
  nombre?: string | null;
  estado: EstadoGestion;
  created_at: string;
  closed_at: string | null;
};

export type GestionCerrada = {
  id_gestion: number;
  anio: number;
  nombre: string | null;
  closed_at: string | null;
  total_areas: number;
};

export type AreaGestionHistorial = {
  id_area_gestion: number;
  id_gestion: number;
  nombre_area: string;
  nota_aprobacion: number | null;
  tipo: "INDIVIDUAL" | "GRUPAL";
  niveles_target: string | null;
  archived_at: string;
};

export type GestionConAreas = {
  id_gestion: number;
  anio: number;
  nombre: string | null;
  estado: "ABIERTA" | "CERRADA";
  closed_at: string | null;
  areas: AreaGestionHistorial[];
};

export type CloseEligibility = {
  canClose: boolean;
  reason: string | null;
  gestionId: number | null;
};

export type CanCloseGestionResponse = {
  canClose: boolean;
  reason: string | null;
  gestionId: number | null;
};

export async function fetchCurrentGestion(): Promise<Gestion | null> {
  const { data } = await api.get<{ gestion: Gestion | null }>(
    "/gestiones/actual"
  );
  return data.gestion ?? null;
}

export async function fetchCanCloseGestion(): Promise<CanCloseGestionResponse> {
  const { data } = await api.get<CanCloseGestionResponse>(
    "/gestiones/can-close"
  );
  return data;
}

export async function closeGestion(): Promise<Gestion> {
  const { data } = await api.post<{ ok: boolean; gestion: Gestion }>(
    "/gestiones/close"
  );
  return data.gestion;
}

export async function openGestion(params: {
  anio: number;
  nombre?: string;
}): Promise<{ ok: boolean; gestion: Gestion }> {
  const { data } = await api.post<{ ok: boolean; gestion: Gestion }>(
    "/gestiones/open",
    params
  );
  return data;
}

/**
 * Listar todas las gestiones
 */
export async function fetchAllGestiones(): Promise<Gestion[]> {
  const { data } = await api.get<{ gestiones: Gestion[] }>("/gestiones");
  return data.gestiones;
}

// ===================== NUEVAS FUNCIONES PARA HISTORIAL =====================

/**
 * Obtener historial completo de áreas por gestiones cerradas
 */
export async function fetchAreasHistorial(): Promise<GestionConAreas[]> {
  const { data } = await api.get<{ historial: GestionConAreas[] }>(
    "/gestiones/historial-areas"
  );
  return data.historial;
}

/**
 * Obtener lista de gestiones cerradas (solo metadatos)
 */
export async function fetchGestionesCerradas(): Promise<GestionCerrada[]> {
  const { data } = await api.get<{ gestiones: GestionCerrada[] }>(
    "/gestiones/cerradas"
  );
  return data.gestiones;
}

/**
 * Obtener áreas de una gestión específica
 */
export async function fetchAreasByGestion(
  idGestion: number
): Promise<AreaGestionHistorial[]> {
  const { data } = await api.get<{ areas: AreaGestionHistorial[] }>(
    `/gestiones/${idGestion}/areas`
  );
  return data.areas;
}

export type ResponsableEquipo = {
  id_responsable_area: number;
  activo: boolean;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string | null;
    experiencia: number | null;
    especialidad: string | null;
    institucion: string | null;
    ci: string | null;
  };
  area: {
    id_area: number;
    nombre_area: string;
  };
};

export type EvaluadorEquipo = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  institucion: string | null;
  especialidad: string | null;
  experiencia: number | null;
  activo: boolean;
  evaluadores_area: {
    area: {
      id_area: number;
      nombre_area: string;
    };
  }[];
};

export type EquipoGestionActualResponse = {
  gestion: Gestion | null;
  responsables: ResponsableEquipo[];
  evaluadores: EvaluadorEquipo[];
};

/**
 * Obtener equipo académico (responsables + evaluadores) de la gestión abierta
 */
export async function fetchEquipoGestionActual(): Promise<EquipoGestionActualResponse> {
  const { data } = await api.get<EquipoGestionActualResponse>(
    "/gestiones/equipo-actual"
  );
  return data;
}
