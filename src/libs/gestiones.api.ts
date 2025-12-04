// src/libs/gestiones.api.ts
import { api } from '@/libs/api';

export type EstadoGestion = 'ABIERTA' | 'CERRADA';

export type Gestion = {
  id_gestion: number;
  anio: number;
  nombre?: string | null;
  estado: EstadoGestion;
  created_at: string;
};

export type CanCloseGestionResponse = {
  canClose: boolean;
  reason: string | null;
  gestionId: number | null;
};

export async function fetchCurrentGestion(): Promise<Gestion | null> {
  const { data } = await api.get<{ gestion: Gestion | null }>('/gestiones/actual');
  return data.gestion ?? null;
}

export async function fetchCanCloseGestion(): Promise<CanCloseGestionResponse> {
  const { data } = await api.get<CanCloseGestionResponse>('/gestiones/can-close');
  return data;
}

export async function closeGestion(): Promise<Gestion> {
  const { data } = await api.post<{ ok: boolean; gestion: Gestion }>('/gestiones/close');
  return data.gestion;
}

export async function openGestion(payload: {
  anio: number;
  nombre?: string;
}): Promise<Gestion> {
  const { data } = await api.post<{ ok: boolean; gestion: Gestion }>(
    '/gestiones/open',
    payload,
  );
  return data.gestion;
}
