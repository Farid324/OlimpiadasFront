// src/components/controlFases/phaseApi.ts
import { api } from "@/libs/api";

export type ClosePhasePayload = {
  type: "CLASIFICACION" | "FINAL";
  comentario?: string;
};

export async function closePhase(
  id_area: number,
  id_nivel: number,
  dto: { type: "CLASIFICACION" | "FINAL"; comentario?: string }
) {
  const { data } = await api.post(`/phases/${id_area}/${id_nivel}/close`, dto);
  return data as {
    ok: boolean;
    message: string;
    status: "CERRADA" | "VALIDADA" | "EN_PROCESO";
  };
}
