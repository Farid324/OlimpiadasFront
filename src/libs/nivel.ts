// src/libs/nivel.ts
import type { NivelCompetencia } from "@/config/catalogs";

export function composeNivelCodigo(nivel: NivelCompetencia, grado: number) {
  const sufijo = nivel === "Primaria" ? "P" : "S";
  if (grado < 1 || grado > 6) throw new Error("Grado fuera de rango");
  return `${grado}º${sufijo}`;
}
