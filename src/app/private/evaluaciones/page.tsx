'use client';
import { useEffect, useState } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import { evaluacionesService, Filters, Stats } from './adminEvaluaciones-service';
import { CompetidorInscripcionAdmin } from '@/types/notas';
import TabsView from './tabsView';
import ClasificarView from './clasificarView';
import PremiacionView from './PremiacionView';

interface Area {
  id_area: number;
  nombre_area: string;
}

interface Nivel {
  id_nivel: number;
  nombre_nivel: string;
}

export default function EvaluacionesPage() {
  const { setTitle } = usePageHeader();

  // 🔹 Estados de referencia
  const [areas, setAreas] = useState<Area[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | undefined>();
  const [selectedNivel, setSelectedNivel] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<'clasificar' | 'premiacion'>('clasificar');

  // 🔹 Estados por fase
  const [competidores, setCompetidores] = useState<CompetidorInscripcionAdmin[]>([]);
  const [competidoresFinales, setCompetidoresFinales] = useState<CompetidorInscripcionAdmin[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsFinales, setStatsFinales] = useState<Stats | null>(null);

  // 🔹 Modales
  const [modalCompetidor, setModalCompetidor] = useState<CompetidorInscripcionAdmin | null>(null);
  const [modalCompetidorFinal, setModalCompetidorFinal] = useState<CompetidorInscripcionAdmin | null>(null);

  // 🔹 Control de carga
  const [loading, setLoading] = useState(false);

  // ================================
  // 🚀 Carga inicial de áreas/niveles
  // ================================
  useEffect(() => {
    setTitle('Evaluaciones');
    (async () => {
      const [a, n] = await Promise.all([
        evaluacionesService.areas(),
        evaluacionesService.niveles(),
      ]);
      setAreas(a);
      setNiveles(n);
    })();
  }, [setTitle]);

  // =================================
  // 🔁 Carga automática según pestaña
  // =================================
  useEffect(() => {
    const filters = { areaId: selectedArea, nivelId: selectedNivel };
    const load = async () => {
      setLoading(true);
      try {
        if (activeTab === 'clasificar') {
          const [list, s] = await Promise.all([
            evaluacionesService.listar(1, filters),
            evaluacionesService.stats(1, filters),
          ]);
          setCompetidores(list);
          setStats(s);
        } else {
          const [list, s] = await Promise.all([
            evaluacionesService.listar(2, filters),
            evaluacionesService.stats(2, filters),
          ]);
          setCompetidoresFinales(list);
          setStatsFinales(s);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, selectedArea, selectedNivel]);

  // ======================
  // 🎛️ Cambio de filtros
  // ======================
  const handleFilters = async ({ areaId, nivelId }: Filters): Promise<void> => {
    setSelectedArea(areaId);
    setSelectedNivel(nivelId);
  };

  // ======================
  // 🖥️ Render principal
  // ======================
  return (
    <div className="-px-2 -py-1 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Encabezado (mismo estilo que Responsables) */}
      <div>
        <h1 className="text-2xl font-bold text-black">Sistema de Evaluaciones</h1>
        <p className="text-gray-500 text-sm">
          Registro y seguimiento de evaluaciones por área y nivel
        </p>
      </div>

      {/* Tabs dentro de tarjeta blanca, como el buscador del otro módulo */}
      
        <div className="mt-1">
          <TabsView onChange={setActiveTab} />
        </div>
     

      {/* Contenido principal en tarjeta blanca, similar a la tabla de responsables */}
      
        {loading && (
          <div className="text-center text-gray-500 py-10">
            Cargando información...
          </div>
        )}

        {!loading && activeTab === 'clasificar' && (
          <ClasificarView
            areas={areas}
            niveles={niveles}
            selectedArea={selectedArea}
            selectedNivel={selectedNivel}
            stats={stats}
            competidores={competidores}
            modalCompetidor={modalCompetidor}
            onChangeFilters={handleFilters}
            onViewCompetidor={setModalCompetidor}
            onCloseModal={() => setModalCompetidor(null)}
          />
        )}

        {!loading && activeTab === 'premiacion' && (
          <PremiacionView
            areas={areas}
            niveles={niveles}
            selectedArea={selectedArea}
            selectedNivel={selectedNivel}
            stats={statsFinales}
            competidores={competidoresFinales}
            modalCompetidor={modalCompetidorFinal}
            onChangeFilters={handleFilters}
            onViewCompetidor={setModalCompetidorFinal}
            onCloseModal={() => setModalCompetidorFinal(null)}
          />
        )}
      
    </div>
  );
}
