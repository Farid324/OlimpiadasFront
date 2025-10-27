export type Competidor = {
  id_inscripcion: number;
  competidor: {
    id_competidor: number;
    nombres: string;
    apellidos: string;
    ci: string;
    escuela: string;
  };
  nota?: number | null;
  evaluaciones: Evaluacion[];
};
export interface Evaluacion {
  id_evaluacion: number;
  nota: number | null;
  estado_registro: string;
}

export interface CompetidorInscripcion {
  id_inscripcion: number;
  estado_inscripcion: string;
  area: { nombre_area: string };
  nivel: { nombre_nivel: string };
  competidor: {
    id_competidor: number;
    nombres: string;
    apellidos: string;
    ci: string;
    escuela: string;
    departamento: string;
  };
  evaluaciones: Evaluacion[];
}
