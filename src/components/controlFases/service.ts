//src/components/controlFases/service.ts
import { getFromAPI } from "./apiClient";
import type { ControlFasesResponse, FilaFase } from "./types";
import { fetchResponsablesMap } from "@/components/controlFases/responsablesApi";
import type { PhaseType } from "./phaseApi";

const ENDPOINT = "/control-fases";

// considera como "vacío" los placeholders del back
function isEmptyResp(v?: string | null): boolean {
  const s = (v ?? "").trim();
  return s === "" || s === "-" || s === "—";
}

export async function fetchControlFases(
  type: PhaseType = "CLASIFICACION"
): Promise<ControlFasesResponse> {
  const [data, respMap] = await Promise.all([
    getFromAPI<ControlFasesResponse>(`${ENDPOINT}?type=${type}`),
    fetchResponsablesMap().catch(() => new Map<string, string>()),
  ]);

  data.filas = data.filas.map((f: FilaFase) => {
    const keyArea = `${f.idArea ?? ""}`;
    const responsableCatalogo = respMap.get(keyArea) ?? "";

    return {
      ...f,
      responsable: !isEmptyResp(f.responsable)
        ? (f.responsable as string)
        : responsableCatalogo,
      fechaHora: f.fechaHora ?? "",
    };
  });

  return data;
}
