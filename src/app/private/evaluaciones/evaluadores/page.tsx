// src/app/private/evaluaciones/evaluadores/page.tsx
'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import { evaluacionesService } from './evaluaciones-service';
import CardsSummary from './cards';
import SearchBar from './buscador';
import FilterTabs from './filtros';
import CompetidorList from './listaOlimpistas';
import ModalEvaluacion from './modalEvaluacion';
import { CompetidorInscripcion } from '@/types/notas';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/libs/api';

/* ===== Tipos ===== */
type AreaDTO = { id: number; nombre: string };
type NivelDTO = { id: number; nombre: string };
type PhaseStatusResponse = {
  closed: boolean;
  status: 'EN_PROCESO' | 'CERRADA' | 'VALIDADA';
};

/* ===== Helpers de catálogos ===== */
const pick = (o: Record<string, unknown> | null | undefined, keys: string[]) =>
  keys.map(k => o?.[k]).find(v => v !== undefined && v !== null);

function mapCatalog<T extends { id: number; nombre: string }>(
  data: unknown,
  idKeys: string[],
  nameKeys: string[],
): T[] {
  const arr = (Array.isArray(data) ? data : []) as ReadonlyArray<Record<string, unknown>>;
  return arr
    .map((r) => ({
      id: Number(pick(r, idKeys)),
      nombre: String(pick(r, nameKeys) ?? '').trim(),
    } as T))
    .filter((x): x is T => !Number.isNaN(x.id) && x.nombre.length > 0);
}

/* ===== Fetch catálogos ===== */
async function getAreas(): Promise<AreaDTO[]> {
  const { data } = await api.get('/admin/evaluaciones/areas');
  return mapCatalog<AreaDTO>(data, ['id_area', 'id', 'value'], ['nombre_area', 'nombre', 'label']);
}
async function getNiveles(): Promise<NivelDTO[]> {
  const { data } = await api.get('/admin/evaluaciones/niveles');
  return mapCatalog<NivelDTO>(data, ['id_nivel', 'id', 'value'], ['nombre_nivel', 'nombre', 'label']);
}

/* ===== Backend error helper ===== */
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function hasResponseData(x: unknown): x is { response: { data?: unknown } } {
  return isRecord(x) && isRecord(x.response);
}
function getBackendError(err: unknown): string {
  const apiData = hasResponseData(err) ? err.response.data : undefined;
  if (isRecord(apiData) && typeof apiData.message === 'string') return apiData.message;
  if (isRecord(apiData) && Array.isArray(apiData.message)) return apiData.message.join(', ');
  if (err instanceof Error && err.message) return err.message;
  return 'No se pudo completar la operación (revisa conexión o duplicados).';
}

/* ===== Componente principal ===== */
export default function EvaluacionesEvaluadoresPage() {
  const { setTitle } = usePageHeader();
  const { user } = useAuth();

  // Estado general
  const [activePhase, setActivePhase] = useState<'CLASIFICACION' | 'FINAL'>('CLASIFICACION');
  const [competidores, setCompetidores] = useState<CompetidorInscripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Pendientes' | 'Evaluados'>('Todos');
  const [modalCompetidor, setModalCompetidor] = useState<CompetidorInscripcion | null>(null);
  const [reloadStats, setReloadStats] = useState(false);

  // Catálogos
  const [niveles, setNiveles] = useState<NivelDTO[]>([]);
  const [idArea, setIdArea] = useState<number | null>(null);
  const [idNivel, setIdNivel] = useState<number | null>(null);

  // Estado de fases por nivel
  const [phaseStatusByNivel, setPhaseStatusByNivel] = useState<Record<number, PhaseStatusResponse>>({});
  const [phaseStatusLoaded, setPhaseStatusLoaded] = useState(false);

  useEffect(() => { setTitle('Evaluaciones'); }, [setTitle]);

  /* ===== Cargar catálogos ===== */
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [, n] = await Promise.all([getAreas(), getNiveles()]);
        if (!cancel) setNiveles(n);
      } finally {
        if (!cancel) setPhaseStatusLoaded(true);
      }
    })();
    return () => { cancel = true; };
  }, []);

  /* ===== Estado de fase por nivel ===== */
  const getEstadoFaseEvaluador = useCallback(async () => {
    if (!user?.id) return;
    try {
      const results = await Promise.all(
        niveles.map(nivel =>
          api
            .get<PhaseStatusResponse>('/admin/evaluaciones/estado-fase-evaluador', {
              params: { idUsuario: user.id, idNivel: nivel.id, tipo: 'CLASIFICACION' },
            })
            .then(res => [nivel.id, res.data] as const)
            .catch(() => [nivel.id, { closed: false, status: 'EN_PROCESO' }] as const)
        )
      );
      const statusResults = Object.fromEntries(results);
      setPhaseStatusByNivel(statusResults);
    } catch (err) {
      console.error('Error al obtener estado de fases:', getBackendError(err));
    } finally {
      setPhaseStatusLoaded(true);
    }
  }, [niveles, user?.id]);

  useEffect(() => {
    if (niveles.length > 0) getEstadoFaseEvaluador();
  }, [niveles, getEstadoFaseEvaluador]);

  /* ===== Fetch competidores ===== */
  const fetchCompetidores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await evaluacionesService.listarCompetidores({
        search: searchQuery || undefined,
        filtro: activeFilter === 'Pendientes' ? 'PENDIENTE' : activeFilter === 'Evaluados' ? 'EVALUADO' : 'TODOS',
        id_area: idArea || undefined,
        id_nivel: idNivel || undefined,
      });
      setCompetidores(data);
    } finally { setLoading(false); }
  }, [searchQuery, activeFilter, idArea, idNivel]);

  const fetchCompetidoresClasificados = useCallback(async () => {
    setLoading(true);
    try {
      const data = await evaluacionesService.getListarCompetidoresClasificados({
        search: searchQuery || undefined,
        id_area: idArea || undefined,
        id_nivel: idNivel || undefined,
      });
      setCompetidores(data);
    } finally { setLoading(false); }
  }, [searchQuery, idArea, idNivel]);

  useEffect(() => {
    if (!phaseStatusLoaded) return;
    if (activePhase === 'CLASIFICACION') fetchCompetidores();
    else fetchCompetidoresClasificados();
  }, [activePhase, phaseStatusLoaded, fetchCompetidores, fetchCompetidoresClasificados]);

  /* ===== Filtrado buscador y status ===== */
  const filteredCompetidores = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return competidores
      .filter(c => {
        const nota = c.evaluaciones?.[0]?.nota ?? null;
        if (activeFilter === 'Pendientes') return nota === null;
        if (activeFilter === 'Evaluados') return nota !== null;
        return true;
      })
      .filter(c => {
        if (!term) return true;
        const comp = c.competidor;
        return (
          comp.nombres?.toLowerCase().includes(term) ||
          comp.apellidos?.toLowerCase().includes(term) ||
          comp.ci?.toLowerCase().includes(term) ||
          comp.escuela?.toLowerCase().includes(term)
        );
      });
  }, [competidores, searchQuery, activeFilter]);

  const hasClosedLevels = useMemo(() => Object.values(phaseStatusByNivel).some(p => p.closed), [phaseStatusByNivel]);

  /* ===== Modales ===== */
  const handleOpenModal = async (competidor: CompetidorInscripcion) => {
    try {
      const evaluacionExistente = competidor.evaluaciones?.[0];
      if (evaluacionExistente && evaluacionExistente.id_evaluacion) {
        const detalle = await evaluacionesService.getDetalleEvaluacion(evaluacionExistente.id_evaluacion);
        setModalCompetidor({ ...competidor, evaluaciones: [detalle] });
      } else {
        setModalCompetidor(competidor);
      }
    } catch (err) {
      console.error('Error al cargar la evaluación completa', err);
      setModalCompetidor(competidor);
    }
  };

  const handleSubmitNota = async (data: { nota: number; descripcionConceptual?: string; etica?: string; comentario?: string; }) => {
    if (!modalCompetidor || !user?.id) return;
    try {
      const idUsuario = Number(user.id);
      const evaluacionExistente = modalCompetidor.evaluaciones?.[0];
      const idFase = activePhase === 'CLASIFICACION' ? 1 : 2;

      if (evaluacionExistente && evaluacionExistente.id_evaluacion) {
        await evaluacionesService.editarNota({
          idEvaluacion: evaluacionExistente.id_evaluacion,
          idUsuario,
          nuevaNota: data.nota,
          comentario: data.comentario,
          idFase,
        });
      } else {
        const nuevaEvaluacion = await evaluacionesService.registrarNota({
          idInscripcion: modalCompetidor.id_inscripcion,
          idUsuario,
          nota: data.nota,
          idFase,
          descripcionConceptual: data.descripcionConceptual,
          etica: data.etica,
          comentario: data.comentario,
        });

        setCompetidores(prev =>
          prev.map(c =>
            c.id_inscripcion === modalCompetidor.id_inscripcion
              ? { ...c, evaluaciones: [{ ...(c.evaluaciones?.[0] ?? {}), id_evaluacion: nuevaEvaluacion.id_evaluacion, nota: data.nota }] }
              : c
          )
        );
      }

      setModalCompetidor(null);
      setReloadStats(prev => !prev);
    } catch (err) {
      console.error('❌ Error al registrar/editar nota:', err);
      if (hasResponseData(err) && err.response.data) console.error('Backend response:', err.response.data);
    }
  };

  /* ===== Render ===== */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-black">Sistema de Evaluaciones</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActivePhase('CLASIFICACION')}
          className={`px-4 py-2 font-medium transition ${
            activePhase === 'CLASIFICACION'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          FASE CLASIFICACIÓN
        </button>

        <button
          disabled={!hasClosedLevels}
          onClick={() => hasClosedLevels && setActivePhase('FINAL')}
          className={`px-4 py-2 font-medium transition ${
            activePhase === 'FINAL'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : hasClosedLevels
              ? 'text-gray-500 hover:text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          FASE FINAL
        </button>
      </div>
      {!hasClosedLevels && <p className="text-sm text-gray-500 italic mt-1">La fase de clasificación aún no ha sido cerrada para ningún nivel.</p>}

      <CardsSummary />

      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-3 items-center">
          <SearchBar onSearch={setSearchQuery} />
          {/* Aquí podrías agregar selects de área y nivel */}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <FilterTabs
            active={activeFilter}
            onChange={(f: string) => {
              if (f === 'Todos' || f === 'Pendientes' || f === 'Evaluados') setActiveFilter(f);
            }}
          />

          <div className="w-full overflow-x-auto">
            {loading ? (
              <p className="text-center text-gray-500 py-6">Cargando competidores...</p>
            ) : (
              <CompetidorList
                data={filteredCompetidores}
                onEvaluar={handleOpenModal}
                onEditar={handleOpenModal}
                mostrarNivel
                mostrarEstado
              />
            )}
          </div>
        </div>
      </div>

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
        />
      )}
    </div>
  );
}
