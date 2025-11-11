'use client';
import { useState, useEffect, useCallback } from 'react';
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

interface PremiacionViewProps {
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

export default function PremiacionView({
  areas,
  niveles,
  selectedArea,
  selectedNivel,
  stats,
  modalCompetidor,
  onChangeFilters,
  onViewCompetidor,
  onCloseModal,
}: PremiacionViewProps) {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalistas, setFinalistas] = useState<CompetidorInscripcionAdmin[]>([]);
  const [statsFinales, setStatsFinales] = useState<Stats | null>(stats);

  // ✅ Función para obtener competidores fase 2 (Final)
  const fetchCompetidoresClasificados = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { areaId: selectedArea, nivelId: selectedNivel };
      const [list, s] = await Promise.all([
        evaluacionesService.listar(2, filters),
        evaluacionesService.stats(2, filters),
      ]);
      setFinalistas(list);
      setStatsFinales(s);
    } catch (err) {
      console.error('Error cargando finalistas:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedArea, selectedNivel]);

  // 🔁 Cargar datos una vez iniciada la fase
  useEffect(() => {
    if (started) {
      fetchCompetidoresClasificados();
    }
  }, [started, fetchCompetidoresClasificados]);

  // 🟢 Botón “Iniciar Evaluación Final”
  if (!started) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-8 flex flex-col items-center text-center">
        <div className="text-gray-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 11.5c2.485 0 4.5-2.015 4.5-4.5S14.485 2.5 12 2.5 7.5 4.515 7.5 7s2.015 4.5 4.5 4.5zm0 0v9m0 0H8m4 0h4"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Evaluación Final</h2>
          <p className="text-sm text-gray-500 mt-1">
            Proceder con la evaluación de los olimpistas clasificados
          </p>
        </div>
        <button
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          onClick={() => setStarted(true)}
        >
          Iniciar Evaluación Final
        </button>
      </div>
    );
  }

  // 🟣 Pantalla principal una vez iniciada la fase
  return (
    <div className="mt-4 space-y-4">
      <Filters
        areas={areas}
        niveles={niveles}
        selectedArea={selectedArea}
        selectedNivel={selectedNivel}
        onChange={onChangeFilters}
      />

      {statsFinales && (
        <>
          <CardsSummary stats={statsFinales} />
          <ProgressBar
            completadas={statsFinales.completadas}
            enProceso={statsFinales.enProceso}
            total={statsFinales.total}
            nombreArea={areas.find((a) => a.id_area === selectedArea)?.nombre_area}
            nombreNivel={niveles.find((n) => n.id_nivel === selectedNivel)?.nombre_nivel}
          />
        </>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-10">Cargando finalistas...</div>
      ) : (
        <CompetidorTable
          data={finalistas}
          onView={onViewCompetidor}
          nombreArea={areas.find((a) => a.id_area === selectedArea)?.nombre_area}
          nombreNivel={niveles.find((n) => n.id_nivel === selectedNivel)?.nombre_nivel}
        />
      )}

      <ModalViewEvaluation
        isOpen={!!modalCompetidor}
        onClose={onCloseModal}
        competidor={modalCompetidor}
      />
    </div>
  );
}
