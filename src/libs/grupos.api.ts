// src/libs/grupos.api.ts

import { api } from "@/libs/api";
import type { CreateGrupoInput } from "@/types/grupo";

const composeNivel = (nivel: "Primaria" | "Secundaria", grado: number) =>
  `${grado}º${nivel === "Primaria" ? "P" : "S"}`;

export async function registerGrupo(input: CreateGrupoInput) {
  const gradoBase = input.miembros[0]?.grado ?? 1;
  const nivelCatalogo = composeNivel(input.nivelCompetencia, gradoBase);

  const payload = {
    nombreEquipo: input.nombreEquipo,
    unidadEducativa: input.unidadEducativa,
    departamento: input.departamento,
    area: input.area,
    nivel: nivelCatalogo,
    miembros: input.miembros.map((m) => ({
      nombreCompleto: m.nombreCompleto,
      ci: m.ci,
      tutorContacto: m.tutorContacto,
      departamento: m.departamento,
      gradoEscolar: composeNivel(input.nivelCompetencia, m.grado),
    })),
  };

  const { data } = await api.post("/grupos/register", payload);
  return data;
}
