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
  comentario: string;
  id_evaluacion: number;
  nota: number | null;
  estado_registro: string;
}

export interface CompetidorInscripcion {
  clasificacion: string;
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

export type EvaluacionMini = {
  id_evaluacion: number;
  nota?: number | null;
  fecha_registro?: string | null;
  estado_registro?: 'BORRADOR' | 'FIRMADA';
  comentario?: string | null;
  evaluador?: { id: number; nombre: string; apellido: string } | null;
};

export type CompetidorInscripcionAdmin = {
  id_inscripcion: number;
  competidor: { id_competidor: number; nombres: string; apellidos: string; ci: string; escuela?: string };
  area?: { id_area: number; nombre_area: string } | null;
  nivel?: { id_nivel: number; nombre_nivel: string } | null;
  evaluaciones?: EvaluacionMini[];
};

