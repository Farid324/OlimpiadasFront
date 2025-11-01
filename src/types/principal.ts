// src/types/principal.ts

// Define la estructura de los datos que vienen del backend
export interface CompetitorData {
  id: number;
  name: string;
  ci: string;
  area: string;
  level: string; // Aunque no se usa en la tabla pública, puede ser útil
  school: string;
  city: string;
  score: number;
  medal: string; // Será 'N/A' por ahora
  year: number;
  status: string; // Será 'Clasificado'
}

// Tipo para el estado de la pestaña activa
export type ActiveTab = 'current' | 'historical';