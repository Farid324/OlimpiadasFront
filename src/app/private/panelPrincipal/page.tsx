// panelPrincipal/page.tsx
import { useEffect, useState } from 'react';

// Tipos definidos directamente aquí
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

  useEffect(() => {
    async function fetchAreas() {
      const res = await fetch('/areas'); // endpoint del backend
      const data: Area[] = await res.json();
      setAreas(data);
      setLoading(false);
    }

    fetchAreas();
  }, []);

  if (loading) return <div className="p-4">Cargando áreas...</div>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {areas.map(area => (
        <div key={area.id_area} className="border rounded-lg p-4 shadow-md bg-white">
          <h2 className="text-xl font-bold mb-2">{area.nombre_area}</h2>
          <p>
            Estado: <span className={`font-semibold ${getEstadoColor(area.estado)}`}>{area.estado}</span>
          </p>
          {area.niveles.length > 0 ? (
            <>
              <p>Nivel: {area.niveles[0].nombre_nivel}</p>
              <p>Inscritos: {area.niveles[0].inscritos}</p>
            </>
          ) : (
            <p>Nivel: N/A | Inscritos: 0</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Función para cambiar color según el estado
function getEstadoColor(estado: string) {
  switch (estado) {
    case 'EVALUANDO':
      return 'text-blue-600';
    case 'CLASIFICANDO':
      return 'text-yellow-600';
    case 'COMPLETADO':
      return 'text-green-600';
    default:
      return '';
  }
}



