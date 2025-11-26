'use client';

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { AxiosError } from 'axios';
import { usePageHeader } from '@/contexts/pageHeader';
// ⚠️ Importamos los íconos de Lucide necesarios para la nueva apariencia
import { 
    LuUsers, LuActivity, LuClipboardList, LuAward, LuTrophy, LuEye, LuUserCog 
} from 'react-icons/lu'; 

// --- Tipos de Datos del Frontend (Actualizados para 7 métricas) ---

type AreaNivelStats = {
  id_area: number;
  nombre_area: string;
  estado: string; // 'EVALUANDO', 'CLASIFICANDO', 'COMPLETADO'
  id_nivel: number;
  nombre_nivel: string;
  total_inscritos: number;
};

type DashboardMetrics = {
  totalOlimpiadas: number;
  totalRegistros: number; 
  totalAreas: number;
  totalEvaluadores: number;
  totalResponsables: number; // <--- NUEVA MÉTRICA
  areasEnEvaluacion: number;
  totalClasificados: number;
  totalPremiados: number;
  areasActivas: number; 
};

type DashboardResponse = {
    metrics: DashboardMetrics;
    areasStats: AreaNivelStats[];
};
// -----------------------


// --- Componente de la Tarjeta de Métrica Principal ---
const MetricCard = ({ icon: Icon, title, value, subtitle }: { 
    icon: React.ElementType, 
    title: string, 
    value: number, 
    subtitle: string 
}) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            {/* ⚠️ Ícono ahora es de color negro (text-black) y tamaño ajustado */}
            <Icon className="w-5 h-5 text-black" /> 
        </div>
        <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className="mt-2">
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
    </div>
);


export default function PanelPrincipalPage() {
  const [areasStats, setAreasStats] = useState<AreaNivelStats[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalOlimpiadas: 0, totalRegistros: 0, totalAreas: 0,
        totalEvaluadores: 0, totalResponsables: 0, 
        areasEnEvaluacion: 0, totalClasificados: 0,
        totalPremiados: 0, areasActivas: 0,
  }); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setTitle } = usePageHeader();

  useEffect(() => {
    setTitle('Panel de Control - Oh! SanSi 2025');
  }, [setTitle]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get<DashboardResponse>(
          '/areas/panel-principal',
        );
        
        setMetrics(data.metrics);
        setAreasStats(data.areasStats);

      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || 'Error al cargar datos del panel.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido al cargar datos.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Cargando panel...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-[#f9fbfd] min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ======================================================= */}
        {/* ## 📈 Tarjetas de Métricas Principales */}
        {/* ======================================================= */}
        <h1 className="sr-only">Métricas Generales</h1>
        {/* Ajuste de grid para 6/7 tarjetas, replicando el diseño de 3 columnas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            
            {/* 1. Total Olimpistas (Total Registros) */}
            <MetricCard 
                icon={LuUsers} // 👥 Ícono de grupo de usuarios como en la imagen
                title="Total Olimpistas" 
                value={metrics.totalRegistros} 
                subtitle={`Registrados en ${metrics.totalAreas} áreas`}
            />

            {/* 2. Evaluadores */}
            <MetricCard 
                icon={LuActivity} // 📈 Ícono de gráfico de pulso como en la imagen
                title="Evaluadores" 
                value={metrics.totalEvaluadores} 
                subtitle={`Asignados por área`}
            />

            {/* 3. RESPONSABLES (NO ESTÁ EN IMAGEN, MANTENEMOS ESTE PARA CONSISTENCIA) */}
            {/* Si quieres que sean 6, puedes eliminar esta tarjeta. */}
            <MetricCard 
                icon={LuUserCog} // ⚙️ Mantener usuario con engranaje
                title="Responsables" 
                value={metrics.totalResponsables} 
                subtitle={`Gestores de áreas`}
            />
            
            {/* 4. En Proceso (Áreas en Evaluación) */}
            <MetricCard 
                icon={LuClipboardList} // 📋 Ícono de portapapeles con lista
                title="En Proceso" 
                value={metrics.areasEnEvaluacion} 
                subtitle={`${metrics.areasEnEvaluacion} áreas en evaluación`}
            />
            
            {/* 5. Clasificados */}
            <MetricCard 
                icon={LuTrophy} // 🏆 Ícono de trofeo como en la imagen
                title="Clasificados" 
                value={metrics.totalClasificados} 
                subtitle={`Para ronda final`}
            />
            
            {/* 6. Premiados */}
            <MetricCard 
                icon={LuAward} // 🥇 Ícono de medalla como en la imagen
                title="Premiados" 
                value={metrics.totalPremiados} 
                subtitle={`Medallas otorgadas`}
            />
            
            {/* 7. Áreas Activas (Total Áreas) */}
             <MetricCard 
                icon={LuEye} // 👁️ Ícono de ojo como en la imagen
                title="Áreas Activas" 
                value={metrics.areasActivas} 
                subtitle={`Disciplinas disponibles`}
            />
            
        </div>
        
        {/* ======================================================= */}
        {/* ## 📊 Estado por Área de Competencia */}
        {/* ======================================================= */}
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
          Estado por Área de Competencia
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mb-6">
          Seguimiento del progreso de evaluación en cada disciplina
        </p>

        {/* Grid responsive: 1 columna en móvil, 2 en sm, 3 en lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areasStats.map((stats) => {
            const total = stats.total_inscritos;
            const key = `${stats.id_area}-${stats.id_nivel}`;
            const estadoFormateado = formatEstado(stats.estado);
            const badgeColor = getEstadoBadgeColor(stats.estado);

            return (
              <div
                key={key}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase truncate">
                    {stats.nombre_area}
                  </h2>

                  {/* Nivel de la tarjeta */}
                  <span className="inline-block bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full mt-2">
                    {stats.nombre_nivel}
                  </span>

                  <p className="text-sm text-gray-600 mt-2">
                    {total} participante{total !== 1 ? 's' : ''} registrado
                    {total !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                  <span
                    className={`text-sm sm:text-sm font-medium px-4 py-1 rounded-full ${badgeColor}`}
                  >
                    {estadoFormateado}
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
    case 'INICIAL': 
      return 'bg-orange-100 text-orange-700';
    case 'CLASIFICANDO':
      return 'bg-lime-100 text-lime-700';
    case 'COMPLETADO':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
