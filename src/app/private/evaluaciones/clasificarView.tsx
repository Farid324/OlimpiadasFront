'use client';
import Filters from './filters';
import CardsSummary from './cardsSummary';
import ProgressBar from './ProgressBar';
import CompetidorTable from './CompetidorTable';
import ModalViewEvaluation from './ModalViewEvaluation';
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

interface ClasificarViewProps {
  areas: Area[];
  niveles: Nivel[];
  selectedArea?: number;
  selectedNivel?: number;
  stats: Stats | null;
  competidores: CompetidorInscripcionAdmin[];
  modalCompetidor: CompetidorInscripcionAdmin | null;
  onChangeFilters: (filters: FiltersInput) => void;
  onViewCompetidor: (c: CompetidorInscripcionAdmin) => void;
  onCloseModal: () => void;
}

export default function ClasificarView({
  areas,
  niveles,
  selectedArea,
  selectedNivel,
  stats,
  competidores,
  modalCompetidor,
  onChangeFilters,
  onViewCompetidor,
  onCloseModal,
}: ClasificarViewProps) {
  return (
    <div className="mt-4 space-y-4">
      <Filters
        areas={areas}
        niveles={niveles}
        selectedArea={selectedArea}
        selectedNivel={selectedNivel}
        onChange={onChangeFilters} 
      />

      {stats && (
        <>
          <CardsSummary stats={stats} />
          <ProgressBar completadas={stats.completadas} total={stats.total} />
        </>
      )}

      <CompetidorTable
        data={competidores}
        onView={onViewCompetidor}
        nombreArea={areas.find((a) => a.id_area === selectedArea)?.nombre_area}
        nombreNivel={niveles.find((n) => n.id_nivel === selectedNivel)?.nombre_nivel}
        />


      <ModalViewEvaluation
        isOpen={!!modalCompetidor}
        onClose={onCloseModal}
        competidor={modalCompetidor}
      />
    </div>
  );
}
