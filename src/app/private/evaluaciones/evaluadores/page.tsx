// src/app/private/evaluaciones/evaluadores/page.tsx
'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import { evaluacionesService } from './evaluaciones-service';
import CardsSummary from '@/components/evaluador/cards';
import SearchBar from '@/components/evaluador/buscador';
import FilterTabs from '@/components/evaluador/filtros';
import CompetidorList from '@/components/evaluador/listaOlimpistas';
import ModalEvaluacion from '@/components/evaluador/modalEvaluacion';
import { Competidor, CompetidorInscripcion } from '@/types/notas';

// ==========================================================
// ✅ Utilidades para manejo de errores del backend
// ==========================================================
type ConstraintItem = { constraints?: Record<string, string> };
type BackendErrorResponse =
  | {
      message?: string | string[];
      errors?: string[];
    }
  | ConstraintItem[]
  | string
  | null
  | undefined;

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === 'string');
}
function isConstraintArray(x: unknown): x is ConstraintItem[] {
  return Array.isArray(x) && x.every((v) => isRecord(v));
}
function hasResponseData(x: unknown): x is { response: { data?: unknown } } {
  return isRecord(x) && isRecord(x.response);
}
function getBackendError(err: unknown): string {
  const apiData: BackendErrorResponse | undefined = hasResponseData(err)
    ? (err.response.data as BackendErrorResponse | undefined)
    : undefined;

  if (isRecord(apiData) && typeof apiData.message === 'string') return apiData.message;
  if (isRecord(apiData) && isStringArray(apiData.message)) return apiData.message.join(', ');
  if (isRecord(apiData) && isStringArray(apiData.errors)) return apiData.errors.join(', ');

  if (isConstraintArray(apiData)) {
    const msgs = apiData
      .flatMap((e) => (e.constraints ? Object.values(e.constraints) : []))
      .filter((t): t is string => typeof t === 'string' && t.length > 0);
    if (msgs.length) return msgs.join(', ');
  }

  if (typeof apiData === 'string') return apiData;
  if (err instanceof Error && err.message) return String(err.message);
  return 'No se pudo completar la operación (revisa conexión o duplicados).';
}

// ==========================================================
// ✅ Componente principal
// ==========================================================
export default function EvaluacionesEvaluadoresPage() {
  const { setTitle } = usePageHeader();
  const [competidores, setCompetidores] = useState<CompetidorInscripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Pendientes' | 'Evaluados'>('Todos');
  const [modalCompetidor, setModalCompetidor] = useState<Competidor | null>(null);

  useEffect(() => {
    setTitle('Evaluaciones');
  }, [setTitle]);

  // ==========================================================
  // ✅ Fetch competidores asignados (useCallback evita warning de deps)
  // ==========================================================
  const fetchCompetidores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await evaluacionesService.listarCompetidores({
        search: searchQuery || undefined,
        filtro:
          activeFilter === 'Pendientes'
            ? 'PENDIENTE'
            : activeFilter === 'Evaluados'
            ? 'EVALUADO'
            : 'TODOS',
      });
      setCompetidores(data);
    } catch (err) {
      console.error('Error al cargar competidores:', getBackendError(err));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    fetchCompetidores();
  }, [fetchCompetidores]);

  // ==========================================================
  // ✅ Registrar / editar nota
  // ==========================================================
  const handleSubmitNota = async (formData: { nota: number }) => {
    if (!modalCompetidor) return;

    const evaluacionExistente = modalCompetidor.evaluaciones?.[0];
    try {
      if (evaluacionExistente) {
        await evaluacionesService.editarNota({
          idEvaluacion: evaluacionExistente.id_evaluacion,
          nuevaNota: Number(formData.nota),
        });
      } else {
        await evaluacionesService.registrarNota({
          idInscripcion: modalCompetidor.id_inscripcion,
          nota: Number(formData.nota),
        });
      }

      await fetchCompetidores();
      setModalCompetidor(null);
    } catch (err) {
      console.error('Error al registrar evaluación:', getBackendError(err));
    }
  };

  // ==========================================================
  // ✅ Filtrado y búsqueda
  // ==========================================================
  const filteredCompetidores = useMemo(() => {
    return (
      competidores
        ?.filter((c) => {
          const evaluaciones = c.evaluaciones ?? [];
          const evaluacion = c.evaluaciones?.[0];
          const nota = evaluacion ? evaluacion.nota : null;
          if (activeFilter === 'Pendientes') return nota === null;
          if (activeFilter === 'Evaluados') return nota !== null;
          return true;
        })
        ?.filter((c) => {
          const term = searchQuery.toLowerCase();
          const comp = c.competidor;
          return (
            comp.nombres.toLowerCase().includes(term) ||
            comp.apellidos.toLowerCase().includes(term) ||
            comp.ci.toLowerCase().includes(term) ||
            comp.escuela.toLowerCase().includes(term)
          );
        }) ?? []
    );
  }, [competidores, searchQuery, activeFilter]);

  // ==========================================================
  // ✅ Render
  // ==========================================================
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panel de Evaluador</h1>

      <CardsSummary />

      {/* Buscador + filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar onSearch={setSearchQuery} />
        <FilterTabs
          active={activeFilter}
          onChange={(filter) => setActiveFilter(filter as 'Todos' | 'Pendientes' | 'Evaluados')}
        />
      </div>

      {/* Lista de competidores */}
      {loading ? (
        <p>Cargando competidores...</p>
      ) : (
        <CompetidorList
          data={filteredCompetidores}
          onEvaluar={(ci) => setModalCompetidor(ci)}
          onEditar={(ci) => setModalCompetidor(ci)}
        />
      )}

      {/* Modal de evaluación */}
      {modalCompetidor && (
        <ModalEvaluacion
          isOpen={!!modalCompetidor}
          onClose={() => setModalCompetidor(null)}
          onSubmit={handleSubmitNota}
          title={`${
            modalCompetidor.evaluaciones?.length > 0
              ? `Editar nota de ${modalCompetidor.competidor.nombres} ${modalCompetidor.competidor.apellidos}`
              : `Evaluar a ${modalCompetidor.competidor.nombres} ${modalCompetidor.competidor.apellidos}`
          }`}
          // 🔧 Asegura que nota sea numérica o undefined
          initialData={
            modalCompetidor.evaluaciones?.[0]
              ? {
                  nota:
                    typeof modalCompetidor.evaluaciones[0].nota === 'number'
                      ? modalCompetidor.evaluaciones[0].nota
                      : undefined,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
