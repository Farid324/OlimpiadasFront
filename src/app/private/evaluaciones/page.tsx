'use client';
import { useEffect, useState } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import { evaluacionesService } from './adminEvaluaciones-service';
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

interface Stats {
  total: number;
  completadas: number;
  enProceso: number;
  pendientes: number;
}

interface FiltersInput {
  areaId?: number;
  nivelId?: number;
}

export default function EvaluacionesPage() {
  const { setTitle } = usePageHeader();
  const [areas, setAreas] = useState<Area[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [competidores, setCompetidores] = useState<CompetidorInscripcionAdmin[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | undefined>();
  const [selectedNivel, setSelectedNivel] = useState<number | undefined>();
  const [modalCompetidor, setModalCompetidor] = useState<CompetidorInscripcionAdmin | null>(null);
  const [activeTab, setActiveTab] = useState<"clasificar" | "premiacion">("clasificar");

  const loadAll = async (filters?: FiltersInput) => {
    const [list, s] = await Promise.all([
      evaluacionesService.listar(filters),
      evaluacionesService.stats(filters),
    ]);
    setCompetidores(list);
    setStats(s);
  };

  useEffect(() => {
    setTitle('Evaluaciones');
  }, [setTitle]);

  useEffect(() => {
    (async () => {
      const [a, n] = await Promise.all([
        evaluacionesService.areas(),
        evaluacionesService.niveles(),
      ]);
      setAreas(a);
      setNiveles(n);
      await loadAll({});
    })();
  }, []);

  const handleFilters = async ({ areaId, nivelId }: FiltersInput): Promise<void> => {
    setSelectedArea(areaId);
    setSelectedNivel(nivelId);
    await loadAll({ areaId, nivelId });
  };

  return (
    <div className= "flex flex-col h-auto bg-gray-50 p-6 space-y-4">
      <h1 className="text-lg font-semibold mb-1">Sistema de Evaluaciones</h1>
      <p className="text-sm text-gray-500 mb-4">
        Registro y seguimiento de evaluaciones por área y nivel
      </p>

      <div className="mt-2 mb-4">
        <TabsView onChange={setActiveTab} />
      </div>


      {activeTab === "clasificar" && (
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

      {activeTab === "premiacion" && <PremiacionView />}
    </div>
  );
}
