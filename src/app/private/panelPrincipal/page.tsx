// panelPrincipal/page.tsx
'use client';

import { useEffect, useState } from 'react';

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
        const res = await fetch('/areas');
        if (!res.ok) throw new Error('Error al cargar áreas');
        const data: Area[] = await res.json();
        setAreas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAreas();
  }, []);

  if (loading) return <div className="p-4">Cargando áreas...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {areas.map(area => {
        const nivel = area.niveles[0];
        return (
          <div key={area.id_area} className="bg-white shadow-lg rounded-xl p-5 border-t-4 border-blue-600 hover:shadow-xl transition">
            <h2 className="text-xl font-bold mb-2">{area.nombre_area}</h2>

            {/* Estado */}
            <p className="mb-2">
              Estado: <span className={`font-semibold ${getEstadoColor(area.estado)}`}>{area.estado}</span>
            </p>

            {/* Nivel */}
            <p className="mb-2">
              Nivel: {nivel ? nivel.nombre_nivel : 'N/A'}
            </p>

            {/* Inscritos */}
            <p className="mb-2 font-semibold">
              Inscritos: {nivel ? nivel.inscritos : 0}
            </p>

            {/* Opcional: botón para ver más detalles */}
            <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Ver detalles
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Función para cambiar color del texto según el estado
function getEstadoColor(estado: string) {
  switch (estado) {
    case 'EVALUANDO':
      return 'text-blue-600';
    case 'CLASIFICANDO':
      return 'text-yellow-600';
    case 'COMPLETADO':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}



