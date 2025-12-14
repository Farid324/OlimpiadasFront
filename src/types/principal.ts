// Ruta: src/types/principal.ts (MODIFICADO)

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
  // 🚨 CAMBIO: medal puede ser null
  medal: string | null; 
  year: number;
  status: string; // Será 'Clasificado', 'Finalista', etc.
  
  // 🚨 ASUMIMOS: Necesitamos el ID de área para filtrar correctamente la API en page.tsx
  idArea: number; 
}

// Tipo para el estado de la pestaña activa
export type ActiveTab = 'current' | 'historical';

export type CeremoniaFilters = {
  id_area?: number;
  id_nivel?: number;
  anio?: number;
  q?: string; // Búsqueda (search query)
};

export type PublicacionFilters = {
  id_area?: number;
  id_nivel?: number;
  anio?: number; // Opcional, pero bueno tenerlo por si quieres filtrar por año
};