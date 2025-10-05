'use client';

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';

// Tipos
type Nivel = {
  id_nivel: number;
  nombre_nivel: string;
  inscritos: number;
};

type Area = {
  id_area: number;
  nombre_area: string;
  estado: string;
  niveles: Nivel[];
};

export default function PanelPrincipalPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAreas() {
      try {
        const { data } = await api.get<Area[]>('/areas');
        setAreas(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar áreas');
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
          {areas.map((area) => {
            const nivel = area.niveles[0];
            return (
              <div
                key={area.id_area}
                className="flex items-center justify-between bg-[#f7f9fb] rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900 uppercase">
                    {area.nombre_area}
                  </h2>

                  {/* Badge de nivel (más gris oscuro) */}
                  <span className="inline-block bg-gray-300 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full mt-1">
                    {nivel ? nivel.nombre_nivel : 'N/A'}
                  </span>

                  <p className="text-sm text-gray-600 mt-2">
                    {nivel ? nivel.inscritos : 0} participantes registrados
                  </p>
                </div>

                <div>
                  <span
                    className={`text-sm font-medium px-4 py-1 rounded-full ${getEstadoBadgeColor(
                      area.estado
                    )}`}
                  >
                    {formatEstado(area.estado)}
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
