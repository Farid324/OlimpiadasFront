// src/components/controlFases/service.ts
import { getFromAPI } from './apiClient';
import type { ControlFasesResponse, FilaFase } from './types';

// ✅ El backend responde en /control-fases (sin /api/v1)
const ENDPOINT = '/control-fases';

export async function fetchControlFases(): Promise<ControlFasesResponse> {
  try {
    return await getFromAPI<ControlFasesResponse>(ENDPOINT);
  } catch (e) {
    console.warn('⚠️ Error al obtener datos reales, usando mock:', e);

    // MOCK de ejemplo
    const filas: FilaFase[] = [
      {
        id: 'mat-sec',
        area: 'Matemáticas',
        nivel: 'Secundaria',
        faseActual: 'Clasificación',
        progresoHecho: 45,
        progresoTotal: 50,
        resumen: { clasificados: 32, noClasificados: 10, descalificados: 3 },
        responsable: 'Prof. Ana Martínez',
        fechaHora: '2025-03-15 14:30',
        estado: 'En progreso',
        accionLabel: 'En progreso',
        accionColor: 'neutral',
        accionDisabled: true,
      },
      {
        id: 'fis-sec',
        area: 'Física',
        nivel: 'Secundaria',
        faseActual: 'Evaluación Final',
        progresoHecho: 30,
        progresoTotal: 35,
        resumen: { clasificados: 30, noClasificados: 0, descalificados: 0 },
        responsable: 'Prof. Carlos Rodríguez',
        fechaHora: '2024-03-15 15:45',
        estado: 'En progreso',
        accionLabel: 'En progreso',
        accionColor: 'neutral',
        accionDisabled: true,
      },
    ];

    return {
      kpis: {
        evaluacionesCompletadas: { valor: 145, total: 155 },
        fasesCompletadas: { valor: 1, total: 4 },
        aprobacionesPendientes: { valor: 1, nota: 'requiere revisión' },
        progresoGeneral: { porcentaje: 94, nota: 'del total completado' },
      },
      filas,
    };
  }
}
