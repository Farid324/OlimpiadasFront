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
};