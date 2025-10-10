// src/config/catalogs.ts
export const DEPARTAMENTOS = [
  "La Paz",
  "Pando",
  "Beni",
  "Santa Cruz",
  "Chuquisaca",
  "Oruro",
  "Potosí",
  "Cochabamba",
  "Tarija",
] as const;

export const NIVELES_COMPETENCIA = ["Primaria", "Secundaria"] as const;

export const GRADOS = [1, 2, 3, 4, 5, 6] as const;

export type NivelCompetencia = (typeof NIVELES_COMPETENCIA)[number];
