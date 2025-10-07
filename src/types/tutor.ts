//src/types/tutor.ts
export type Tutor = {
  id: number;
  nombreCompleto: string;
  ci?: string | null;
  correo?: string | null;
  telefono: string;
  unidadEducativa?: string | null;
  relacionados: number; 
};

export type CreateTutorInput = {
  nombreCompleto: string;
  ci?: string;
  correo?: string;
  telefono: string;
  unidadEducativa?: string;
};
