// src/app/private/olimpistas/page.tsx
'use client';
import { useEffect, useState} from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import Filters from './filters';
import CardsSummary from './cardsSummary';
import ProgressBar from './ProgressBar';
import CompetidorTable from './CompetidorTable';
import ModalViewEvaluation from './ModalViewEvaluation';
import { evaluacionesService } from './adminEvaluaciones-service';
import { CompetidorInscripcionAdmin } from '@/types/notas';

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
    // <div className="bg-white border rounded-xl p-6 shadow-sm">
    //   <h2 className="text-xl font-semibold mb-2">Listado de Evaluaciones</h2>
    //   <p className="text-gray-700">Aquí va el contenido de la sección.</p>
    // </div>
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Evaluaciones - Vista del Admin</h1>

      <Filters
        areas={areas}
        niveles={niveles}
        selectedArea={selectedArea}
        selectedNivel={selectedNivel}
        onChange={handleFilters}
      />

      {stats && (
        <>
          <CardsSummary stats={stats} />
          <ProgressBar completadas={stats.completadas} total={stats.total} />
        </>
      )}

      <CompetidorTable data={competidores} onView={(c) => setModalCompetidor(c)} />

      <ModalViewEvaluation
        isOpen={!!modalCompetidor}
        onClose={() => setModalCompetidor(null)}
        competidor={modalCompetidor}
      />
    </div>
  );
}
