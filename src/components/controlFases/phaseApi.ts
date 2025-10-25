// src/components/controlFases/phaseApi.ts

import { getFromAPI } from './apiClient';

const BASE = '';

export type ClosePhasePayload = {
  type: 'CLASIFICACION' | 'FINAL';
  comentario?: string;
};

export async function closePhase(
  id_area: number,
  id_nivel: number,
  payload: ClosePhasePayload
) {
  const path = `/phases/${id_area}/${id_nivel}/close`;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${path}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    let msg = 'No se pudo cerrar la fase.';
    try {
      const j = await res.json();
      if (j?.message) msg = Array.isArray(j.message) ? j.message.join('. ') : j.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json() as Promise<{ ok: boolean; message: string; status: string }>;
}
