//src/libs/tutores.api.ts
import { api } from "@/libs/api";
import type { CreateTutorInput, Tutor } from "@/types/tutor";

export async function searchTutores(q: string) {
  const { data } = await api.get<Tutor[]>("/tutores", { params: { q } });
  return data;
}

export async function createTutor(input: CreateTutorInput) {
  const { data } = await api.post<{ tutorId: number; linked: number }>(
    "/tutores",
    input
  );
  return data;
}

export async function getTutor(id: number) {
  const { data } = await api.get<{
    id: number;
    nombreCompleto: string;
    ci?: string;
    correo?: string;
    telefono: string;
    unidadEducativa?: string;
    relacionados: number;
    competidores: { id: number; nombreCompleto: string; ci: string }[];
  }>(`/tutores/${id}`);
  return data;
}
