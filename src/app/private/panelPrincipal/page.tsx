'use client';

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { AxiosError } from 'axios'; // <- Importar AxiosError
import { usePageHeader } from '@/contexts/pageHeader';

// Tipos ajustados para reflejar la combinación de Área y Nivel (una tarjeta por combinación)
type AreaNivelStats = {
  id_area: number;
  nombre_area: string;
  estado: string;
  id_nivel: number; // Identificador del nivel
  nombre_nivel: string; // Nombre del nivel
  total_inscritos: number;
};

export default function PanelPrincipalPage() {
  const [areasStats, setAreasStats] = useState<AreaNivelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setTitle } = usePageHeader();
  
  useEffect(() => {
    setTitle('Panel Principal');
  }, [setTitle]);

  useEffect(() => {
    async function fetchAreas() {
      try {
        // Ahora esperamos el array de combinaciones (Área/Nivel)
        const { data } = await api.get<AreaNivelStats[]>('/areas'); 
        setAreasStats(data);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          // Tipado seguro de AxiosError
          setError(err.response?.data?.message || 'Error al cargar áreas');
        } else if (err instanceof Error) {
          // Otros errores normales
          setError(err.message);
        } else {
          setError('Error desconocido al cargar áreas');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAreas();
  }, []);

  if (loading) return <div className="p-6">Cargando áreas...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="bg-[#f9fbfd] min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-lg font-semibold text-gray-800 mb-1">
          Estado por Área de Competencia
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Seguimiento del progreso de evaluación en cada disciplina
        </p>

        <div className="space-y-4">
          {/* Mapeamos el array plano, cada entrada es una tarjeta de (Área + Nivel) */}
          {areasStats.map((stats) => {
            const total = stats.total_inscritos;
            const key = `${stats.id_area}-${stats.id_nivel}`; // Clave única: AreaID-NivelID
            
            return (
              <div
                key={key}
                className="flex items-center justify-between bg-[#f7f9fb] rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900 uppercase">
                    {stats.nombre_area}
                  </h2>

                  {/* Mostramos el nivel específico de la tarjeta */}
                  <span className="inline-block bg-gray-300 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full mt-1">
                    {stats.nombre_nivel}
                  </span>

                  <p className="text-sm text-gray-600 mt-2">
                    {total} participante{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
                  </p>
                </div>

                <div>
                  <span
                    className={`text-sm font-medium px-4 py-1 rounded-full ${getEstadoBadgeColor(
                      stats.estado
                    )}`}
                  >
                    {formatEstado(stats.estado)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === Helpers ===
function formatEstado(estado: string) {
  const lower = estado.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function getEstadoBadgeColor(estado: string) {
  switch (estado.toUpperCase()) {
    case 'EVALUANDO':
      return 'bg-orange-100 text-orange-700';
    case 'CLASIFICANDO':
      return 'bg-lime-100 text-lime-700';
    case 'COMPLETADO':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}