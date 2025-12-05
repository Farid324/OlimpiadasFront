// src/app/private/gestion/tabs/AreasGestionTab.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  GraduationCap,
  Award,
  ChevronDown,
  Filter,
  Archive,
  Loader2,
} from 'lucide-react';
import {
  fetchAreasHistorial,
  type GestionConAreas,
  type AreaGestionHistorial,
} from '@/libs/gestiones.api';

export default function AreasGestionTab() {
  const [gestiones, setGestiones] = useState<GestionConAreas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de Paginación (Cargar más)
  const [visibleCount, setVisibleCount] = useState(10);

  // Estado de Filtros
  const [selectedYear, setSelectedYear] = useState<string>('Todos');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const historial = await fetchAreasHistorial();
      setGestiones(historial);
    } catch (e) {
      console.error('Error cargando historial de áreas:', e);
      setError('No se pudo cargar el historial de áreas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aplanar todas las áreas de todas las gestiones en un solo array
  const allAreas = useMemo(() => {
    const areas: (AreaGestionHistorial & { gestionAnio: number; gestionNombre: string | null })[] = [];

    gestiones.forEach((gestion) => {
      gestion.areas.forEach((area) => {
        areas.push({
          ...area,
          gestionAnio: gestion.anio,
          gestionNombre: gestion.nombre,
        });
      });
    });

    // Ordenar por fecha de archivado descendente
    return areas.sort(
      (a, b) =>
        new Date(b.archived_at).getTime() - new Date(a.archived_at).getTime()
    );
  }, [gestiones]);

  // Filtrar por año seleccionado
  const filteredAreas = useMemo(() => {
    if (selectedYear === 'Todos') return allAreas;
    return allAreas.filter((a) => a.gestionAnio.toString() === selectedYear);
  }, [allAreas, selectedYear]);

  // Áreas visibles (paginación)
  const visibleAreas = filteredAreas.slice(0, visibleCount);

  // Agrupar áreas visibles por año de gestión
  const groupedAreas = useMemo(() => {
    const groups: Record<
      string,
      (AreaGestionHistorial & { gestionAnio: number; gestionNombre: string | null })[]
    > = {};

    visibleAreas.forEach((area) => {
      const year = area.gestionAnio.toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(area);
    });

    // Ordenar años descendente (2024, 2023...)
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [visibleAreas]);

  // Años disponibles para el filtro
  const yearsAvailable = useMemo(() => {
    const years = new Set<string>();
    gestiones.forEach((g) => years.add(g.anio.toString()));
    return Array.from(years).sort().reverse();
  }, [gestiones]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // Resetear paginación cuando cambia el filtro
  useEffect(() => {
    setVisibleCount(10);
  }, [selectedYear]);

  // Estado vacío cuando no hay gestiones cerradas
  if (!loading && gestiones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Archive className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Sin historial de gestiones
        </h3>
        <p className="text-gray-500 max-w-md">
          El historial de áreas aparecerá aquí cuando se cierre una gestión.
          Las áreas de la gestión actual se archivarán automáticamente al cerrarla.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <div>
          <h3 className="text-gray-900 font-bold text-lg">Historial de Áreas</h3>
          <p className="text-gray-500 text-sm">
            Áreas archivadas de gestiones anteriores
          </p>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm"
          >
            <option value="Todos">Todas las gestiones</option>
            {yearsAvailable.map((y) => (
              <option key={y} value={y}>
                Gestión {y}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button
            onClick={fetchData}
            className="ml-2 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <span>Cargando historial de gestiones...</span>
        </div>
      ) : groupedAreas.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">
            No hay áreas registradas para el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-500">
          {groupedAreas.map(([year, areaList]) => {
            // Buscar el nombre de la gestión para este año
            const gestion = gestiones.find((g) => g.anio.toString() === year);
            const gestionLabel = gestion?.nombre
              ? `Gestión ${year} – ${gestion.nombre}`
              : `Gestión ${year}`;

            return (
              <div key={year} className="relative">
                {/* Etiqueta del Año */}
                <div className="flex items-center gap-4 mb-6 sticky top-20 z-0">
                  <div className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {gestionLabel}
                  </div>
                  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1" />
                  <span className="text-xs text-gray-400 bg-white px-2">
                    {areaList.length} área{areaList.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Lista Vertical de Afiches */}
                <div className="flex flex-col gap-4">
                  {areaList.map((area) => (
                    <AreaRowCard key={area.id_area_gestion} area={area} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botón Ver Más */}
      {visibleCount < filteredAreas.length && (
        <div className="flex justify-center pt-6 pb-10">
          <button
            onClick={handleLoadMore}
            className="group relative px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-full shadow-sm hover:shadow-md hover:border-gray-400 transition-all active:scale-95"
          >
            <span className="flex items-center gap-2">
              Cargar siguientes 10 áreas
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </span>
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              +{filteredAreas.length - visibleCount}
            </span>
          </button>
        </div>
      )}

      {/* Footer Informativo */}
      {!loading && filteredAreas.length > 0 && (
        <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
          Mostrando {Math.min(visibleCount, filteredAreas.length)} de{' '}
          {filteredAreas.length} áreas históricas
        </div>
      )}
    </div>
  );
}

// --- Componente de Afiche Individual (Diseño Horizontal) ---
type AreaCardProps = {
  area: AreaGestionHistorial & {
    gestionAnio: number;
    gestionNombre: string | null;
  };
};

function AreaRowCard({ area }: AreaCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-0 hover:shadow-md transition-all duration-300 hover:border-blue-300 relative overflow-hidden flex flex-col sm:flex-row">
      {/* Barra lateral de color */}
      <div
        className={`sm:w-1.5 w-full h-1 sm:h-auto ${
          area.tipo === 'GRUPAL' ? 'bg-purple-500' : 'bg-blue-500'
        }`}
      />

      <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        {/* Sección Izquierda: Identidad */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${
                area.tipo === 'GRUPAL'
                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}
            >
              {area.tipo === 'GRUPAL' ? 'Grupal' : 'Individual'}
            </span>
            {/* Fecha de archivado */}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(area.archived_at).toLocaleDateString('es-BO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
            {area.nombre_area}
          </h4>
        </div>

        {/* Sección Derecha: Datos Clave */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-8 text-sm mt-2 sm:mt-0">
          {/* Nota */}
          <div className="flex items-center gap-3 min-w-[110px]">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600 border border-orange-100">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Aprobación
              </span>
              <span className="font-mono font-bold text-gray-900 text-base">
                {area.nota_aprobacion ?? 51} pts
              </span>
            </div>
          </div>

          {/* Niveles */}
          <div className="flex items-center gap-3 min-w-[150px]">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Niveles
              </span>
              <span
                className="text-gray-700 font-medium truncate max-w-[180px]"
                title={area.niveles_target || ''}
              >
                {area.niveles_target || 'Sin asignar'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}