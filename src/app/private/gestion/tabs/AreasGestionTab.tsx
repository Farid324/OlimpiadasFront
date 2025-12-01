// src/app/private/gestion/tabs/AreasGestionTab.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
// import { api } from '@/libs/api';
import { 
  Calendar, 
  Users, 
  User, 
  GraduationCap, 
  Award, 
  ChevronDown, 
  Filter 
} from 'lucide-react';

// --- Tipos ---

// 1. Tipo para la respuesta cruda del backend
type AreaRawResponse = {
  id_area: number | string;
  nombre_area: string;
  nota_aprobacion?: number | string | null;
  tipo?: 'INDIVIDUAL' | 'GRUPAL' | null;
  niveles_target?: string | null;
  activo?: boolean;
  created_at?: string | null;
};

// 2. Tipo mapeado para usar en la UI
type AreaGestionDTO = {
  id_area: number;
  nombre_area: string;
  nota_aprobacion: number;
  tipo: 'INDIVIDUAL' | 'GRUPAL';
  niveles_target: string | null;
  activo: boolean;
  createdAt: string;
};

export default function AreasGestionTab() {
  const [areas, setAreas] = useState<AreaGestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado de Paginación (Cargar más)
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Estado de Filtros
  const [selectedYear, setSelectedYear] = useState<string>('Todos');

  const fetchAreas = async () => {
    setLoading(true);
    try {
      // =================================================================================
      // ⚠️ AQUÍ AGREGAMOS LOS DATOS POBLADOS (MOCK DATA)
      // =================================================================================
      // En un escenario real, harías: const { data } = await api.get<AreaRawResponse[]>('/areas');
      // Pero como quieres simular historial de 2024 y 2023:
      
      const simulatedData: AreaRawResponse[] = Array.from({ length: 46 }).map((_, i) => {
          // Lógica: Los primeros 23 son del 2024, los siguientes 23 son del 2023.
          // i va de 0 a 45.
          // si i < 23 (0 a 22) -> Año 2024
          // si i >= 23 (23 a 45) -> Año 2023
          const year = i < 23 ? 2024 : 2023;
          
          // Mes aleatorio (0-11) para que no tengan todos la misma fecha exacta
          const month = Math.floor(Math.random() * 12); 
          const day = Math.floor(Math.random() * 28) + 1;

          return {
              id_area: i + 1000, // ID simulado
              nombre_area: `Área Académica ${i + 1} - Disciplina ${String.fromCharCode(65 + (i % 26))}`,
              nota_aprobacion: 51 + (i % 20),
              tipo: i % 3 === 0 ? 'GRUPAL' : 'INDIVIDUAL',
              niveles_target: i % 2 === 0 ? 'Primaria, Secundaria' : 'Secundaria',
              activo: true,
              // Generamos la fecha ISO con el año específico (2024 o 2023)
              created_at: new Date(year, month, day).toISOString()
          };
      });
      // =================================================================================

      const mapped: AreaGestionDTO[] = simulatedData.map((d) => ({
            id_area: Number(d.id_area),
            nombre_area: d.nombre_area,
            nota_aprobacion: d.nota_aprobacion ? Number(d.nota_aprobacion) : 51,
            tipo: (d.tipo as 'INDIVIDUAL' | 'GRUPAL') ?? 'INDIVIDUAL',
            niveles_target: d.niveles_target ?? 'No asignado',
            activo: d.activo ?? true,
            createdAt: d.created_at ?? new Date().toISOString()
      }));

      // Ordenamos por fecha descendente: Lo más reciente arriba (2024 -> 2023)
      const sorted = mapped.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAreas(sorted);
    } catch (e) {
      console.error("Error cargando áreas de gestión", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // --- Lógica de Filtrado y Paginación ---

  const filteredAreas = useMemo(() => {
    if (selectedYear === 'Todos') return areas;
    return areas.filter(a => new Date(a.createdAt).getFullYear().toString() === selectedYear);
  }, [areas, selectedYear]);

  const visibleAreas = filteredAreas.slice(0, visibleCount);

  const groupedAreas = useMemo(() => {
    const groups: Record<string, AreaGestionDTO[]> = {};
    visibleAreas.forEach(area => {
      const year = new Date(area.createdAt).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(area);
    });
    // Ordenar años descendente (2024, 2023...)
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [visibleAreas]);

  const yearsAvailable = Array.from(new Set(areas.map(a => new Date(a.createdAt).getFullYear().toString()))).sort().reverse();

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  useEffect(() => {
    setVisibleCount(10);
  }, [selectedYear]);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <div>
            <h3 className="text-gray-900 font-bold text-lg">Historial de Áreas</h3>
            <p className="text-gray-500 text-sm">Visualización operativa por gestión anual</p>
        </div>

        <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm"
            >
                <option value="Todos">Todas las gestiones</option>
                {yearsAvailable.map(y => (
                    <option key={y} value={y}>Gestión {y}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Lista Vertical Agrupada */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Cargando historial de gestiones...</div>
      ) : groupedAreas.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">No hay áreas registradas para mostrar.</p>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-500">
            {groupedAreas.map(([year, areaList]) => (
                <div key={year} className="relative">
                    {/* Etiqueta del Año */}
                    <div className="flex items-center gap-4 mb-6 sticky top-20 z-0">
                        <div className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Gestión {year}
                        </div>
                        <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                    </div>

                    {/* Lista Vertical de Afiches (1 columna, diseño horizontal) */}
                    <div className="flex flex-col gap-4">
                        {areaList.map((area) => (
                            <AreaRowCard key={area.id_area} area={area} />
                        ))}
                    </div>
                </div>
            ))}
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
      <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
        Mostrando {Math.min(visibleCount, filteredAreas.length)} de {filteredAreas.length} áreas históricas
      </div>
    </div>
  );
}

// --- Componente de Afiche Individual (Diseño Horizontal) ---
function AreaRowCard({ area }: { area: AreaGestionDTO }) {
    return (
        <div className="group bg-white border border-gray-200 rounded-xl p-0 hover:shadow-md transition-all duration-300 hover:border-blue-300 relative overflow-hidden flex flex-col sm:flex-row">
            
            {/* Barra lateral de color */}
            <div className={`sm:w-1.5 w-full h-1 sm:h-auto ${area.tipo === 'GRUPAL' ? 'bg-purple-500' : 'bg-blue-500'}`} />

            <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                
                {/* Sección Izquierda: Identidad */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${
                            area.tipo === 'GRUPAL' 
                                ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                            {area.tipo === 'GRUPAL' ? 'Grupal' : 'Individual'}
                        </span>
                        {/* Fecha pequeña simulada */}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(area.createdAt).toLocaleDateString()}
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
                            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Aprobación</span>
                            <span className="font-mono font-bold text-gray-900 text-base">{area.nota_aprobacion} pts</span>
                        </div>
                    </div>

                    {/* Niveles */}
                    <div className="flex items-center gap-3 min-w-[150px]">
                         <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Niveles</span>
                             <span className="text-gray-700 font-medium truncate max-w-[180px]" title={area.niveles_target || ''}>
                                {area.niveles_target || 'Sin asignar'}
                             </span>
                        </div>
                    </div>

                    {/* Tipo Icono (Visual) */}
                    <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border border-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {area.tipo === 'GRUPAL' ? <Users className="w-6 h-6" /> : <User className="w-6 h-6" />}
                    </div>

                </div>
            </div>
        </div>
    );
}