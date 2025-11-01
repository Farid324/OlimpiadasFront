// src/components/controlFases/responsable/service.ts
import { getFromAPI } from "../apiClient";
// si tienes postToAPI ya creado en apiClient, impórtalo:
import { postToAPI } from "../apiClient";
import type { ControlFasesRespPayload, FilaFaseResp } from "./types";

const ENDPOINT = "control-fases/responsables";

function isEmpty(v?: string | null) {
  const s = (v ?? "").trim();
  return s === "" || s === "-" || s === "—";
}

function readCurrentUserFullName(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const u = JSON.parse(raw);
    const name =
      [u?.nombre, u?.apellido].filter(Boolean).join(" ").trim() ||
      [u?.usuario?.nombre, u?.usuario?.apellido]
        .filter(Boolean)
        .join(" ")
        .trim();
    if (name) return name;
    const email = u?.correo ?? u?.email;
    if (email && typeof email === "string" && email.includes("@")) {
      return email.split("@")[0];
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchControlFasesResp(): Promise<ControlFasesRespPayload> {
  const data = await getFromAPI<ControlFasesRespPayload>(ENDPOINT);
  const meName = readCurrentUserFullName();

  const filas: FilaFaseResp[] = (data.filas ?? []).map((f) => {
    const responsable = !isEmpty(f.responsable) ? f.responsable : meName ?? "—";
    const fechaHora = f.fechaHora ?? "";

    // UI de acción: sólo cuando está "Listo para aprobar"
    const accionLabel =
      typeof f.accionLabel === "string" && f.accionLabel.trim() !== ""
        ? f.accionLabel
        : f.estado === "Listo para aprobar"
        ? "Aprobar Clasificación"
        : undefined;

    const accionColor = f.accionColor ?? "primary";

    const accionDisabled =
      typeof f.accionDisabled === "boolean"
        ? f.accionDisabled
        : f.estado !== "Listo para aprobar";

    return {
      ...f,
      responsable,
      fechaHora,
      accionLabel,
      accionColor,
      accionDisabled,
    };
  });

  return { ...data, filas };
}

// --------- acción ---------
export async function aprobarFaseResp(id: number | string): Promise<void> {
  // Ajusta el endpoint si tu back usa otra ruta
  await postToAPI(`${ENDPOINT}/${id}/approve`, {});
}
