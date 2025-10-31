// src/components/controlFases/phaseApi.ts
import { api } from "@/libs/api";
import type { AxiosError } from "axios";

export type PhaseType = "CLASIFICACION" | "FINAL";

export interface ClosePhaseRequest {
  type: PhaseType;
  comentario?: string;
}

interface BackendError {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Cierra una fase de evaluación (HU-16).
 * Solo roles permitidos: RESPONSABLE_DE_AREA.
 */
export async function closePhase(
  idArea: number,
  idNivel: number,
  body: ClosePhaseRequest
): Promise<void> {
  try {
    await api.post(`/phases/${idArea}/${idNivel}/close`, body);
  } catch (error: unknown) {
    const err = error as AxiosError<BackendError>;
    const beMsg = err.response?.data?.message;
    const message = Array.isArray(beMsg)
      ? beMsg.join(". ")
      : beMsg || "No se pudo cerrar la fase. Verifica tus permisos o conexión.";
    throw new Error(message);
  }
}

/**
 * Valida el cierre definitivo de una fase (HU-17).
 * Solo roles permitidos: RESPONSABLE_DE_AREA.
 */
export async function validatePhase(
  idArea: number,
  idNivel: number,
  body: ClosePhaseRequest
): Promise<void> {
  try {
    await api.post(`/phases/${idArea}/${idNivel}/validate`, body);
  } catch (error: unknown) {
    const err = error as AxiosError<BackendError>;
    const beMsg = err.response?.data?.message;
    const message = Array.isArray(beMsg)
      ? beMsg.join(". ")
      : beMsg ||
        "No se pudo validar el cierre. Verifica tus permisos o conexión.";
    throw new Error(message);
  }
}
