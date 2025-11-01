//src/components/controlFases/service.ts
import { getFromAPI } from "./apiClient";
import type { ControlFasesResponse, FilaFase } from "./types";
import { fetchResponsablesMap } from "@/components/controlFases/responsablesApi";

const ENDPOINT = "/control-fases";

// considera como "vacío" los placeholders del back
function isEmptyResp(v?: string | null) {
  const s = (v ?? "").trim();
  return s === "" || s === "-" || s === "—";
}

export async function fetchControlFases(): Promise<ControlFasesResponse> {
  const [data, respMap] = await Promise.all([
    getFromAPI<ControlFasesResponse>(ENDPOINT),
    fetchResponsablesMap().catch(() => new Map<string, string>()),
  ]);

  data.filas = data.filas.map((f: FilaFase) => {
    const keyArea = `${f.idArea ?? ""}`; // catálogo por área
    const responsableCatalogo = respMap.get(keyArea) ?? "";

    return {
      ...f,
      // si viene "—" desde el back, lo tratamos como vacío y usamos el catálogo
      responsable: !isEmptyResp(f.responsable)
        ? (f.responsable as string)
        : responsableCatalogo,
      // la fecha se respeta tal cual
      fechaHora: f.fechaHora ?? "",
    };
  });

  return data;
}
