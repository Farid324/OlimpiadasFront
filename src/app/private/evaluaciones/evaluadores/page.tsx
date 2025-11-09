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
import { ChevronDown } from 'lucide-react';
import { api } from '@/libs/api';

/* ===== Tipos de catálogos ===== */
type AreaDTO  = { id: number; nombre: string };
type NivelDTO = { id: number; nombre: string };

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
    .map((r) =>
      ({
        id: Number(pick(r, idKeys)),
        nombre: String(pick(r, nameKeys) ?? '').trim(),
      } as T),
    )
    .filter((x): x is T => !Number.isNaN(x.id) && x.nombre.length > 0);
}

/** 🔁 RUTAS CORRECTAS A CATALOGOS */
async function getAreas(): Promise<AreaDTO[]> {
  const { data } = await api.get('/admin/evaluaciones/areas');
  return mapCatalog<AreaDTO>(data, ['id_area', 'id', 'value'], ['nombre_area', 'nombre', 'label']);
}
async function getNiveles(): Promise<NivelDTO[]> {
  const { data } = await api.get('/admin/evaluaciones/niveles');
  return mapCatalog<NivelDTO>(data, ['id_nivel', 'id', 'value'], ['nombre_nivel', 'nombre', 'label']);
}

/* ===== Utilidades error ===== */
type ConstraintItem = { constraints?: Record<string, string> };
type BackendErrorResponse =
  | { message?: string | string[]; errors?: string[] }
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

/* ===== Componente principal ===== */
export default function EvaluacionesEvaluadoresPage() {
  const { setTitle } = usePageHeader();
  const [competidores, setCompetidores] = useState<CompetidorInscripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Pendientes' | 'Evaluados'>('Todos');
  const [modalCompetidor, setModalCompetidor] = useState<CompetidorInscripcion | null>(null);
  const { user } = useAuth();
  const [reloadStats, setReloadStats] = useState(false);

  useEffect(() => { setTitle('Evaluaciones'); }, [setTitle]);

  /* ===== Estado de filtros y catálogos ===== */
  const [idArea, setIdArea]   = useState<number | null>(null);
  const [idNivel, setIdNivel] = useState<number | null>(null);
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [niveles, setNiveles] = useState<NivelDTO[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  /* ===== Cargar catálogos (área y nivel) ===== */
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoadingCatalogs(true);
        const [a, n] = await Promise.all([getAreas(), getNiveles()]);
        if (!cancel) { setAreas(a); setNiveles(n); }
      } finally {
        if (!cancel) setLoadingCatalogs(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  /* ===== Fetch competidores asignados ===== */
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
        // NO enviar 0 ni null al API
        id_area:  idArea  != null && idArea  !== 0 ? idArea  : undefined,
        id_nivel: idNivel != null && idNivel !== 0 ? idNivel : undefined,
      });
      setCompetidores(data);
    } catch (err) {
      console.error('Error al cargar competidores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter, idArea, idNivel]);

  const filteredCompetidores = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return competidores
      .filter((c) => {
        const nota = c.evaluaciones?.[0]?.nota ?? null;
        if (activeFilter === 'Pendientes') return nota === null;
        if (activeFilter === 'Evaluados') return nota !== null;
        return true;
      })
      .filter((c) => {
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

  //useEffect(() => { fetchCompetidores(); }, [fetchCompetidores]);

  const fetchCompetidoresClasificados = useCallback(async () => {
    setLoading(true);
    try {
      const data = await evaluacionesService.getListarCompetidoresClasificados({
        search: searchQuery || undefined,
        // filtro:
        //   activeFilter === 'Pendientes'
        //     ? 'PENDIENTE'
        //     : activeFilter === 'Evaluados'
        //     ? 'EVALUADO'
        //     : 'TODOS',
        // NO enviar 0 ni null al API
        id_area:  idArea  != null && idArea  !== 0 ? idArea  : undefined,
        id_nivel: idNivel != null && idNivel !== 0 ? idNivel : undefined,
      });
      setCompetidores(data);
    } catch (err) {
      console.error('Error al cargar competidores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, idArea, idNivel]);

  const filteredCompetidoresClasificados = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return competidores
      .filter((c) => {
        const nota = c.evaluaciones?.[0]?.nota ?? null;
        if (activeFilter === 'Pendientes') return nota === null;
        if (activeFilter === 'Evaluados') return nota !== null;
        return true;
      })
      .filter((c) => {
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

  useEffect(() => { fetchCompetidoresClasificados(); }, [fetchCompetidoresClasificados]);
  
  const handleOpenModal = async (competidor: CompetidorInscripcion) => {
    try {
      const evaluacionExistente = competidor.evaluaciones?.[0];
      console.log('Evaluaciones del competidor:', competidor.evaluaciones);

      if (evaluacionExistente && evaluacionExistente.id_evaluacion) {
        const detalle = await evaluacionesService.getDetalleEvaluacion(
          evaluacionExistente.id_evaluacion
        );
        setModalCompetidor({ ...competidor, evaluaciones: [detalle] });
      } else {
        console.warn('⚠️ Competidor sin id_evaluacion, no se cargó detalle');
        setModalCompetidor(competidor);
      }
    } catch (err) {
      console.error('Error al cargar la evaluación completa', err);
      setModalCompetidor(competidor);
    }
  };

  /* ===== Registrar / editar nota ===== */
  const handleSubmitNota = async (data: {
    nota: number;
    descripcionConceptual?: string;
    etica?: string;
    comentario?: string;
  }) => {
    if (!modalCompetidor) return;

    try {
      const idUsuario = Number(user?.id);
      const evaluacionExistente = modalCompetidor.evaluaciones?.[0];

      if (evaluacionExistente && evaluacionExistente.id_evaluacion) {
        const idEvaluacion = evaluacionExistente.id_evaluacion;
        await evaluacionesService.editarNota({
          idEvaluacion,
          idUsuario,
          nuevaNota: data.nota,
          comentario: data.comentario,
          idFase: 2,
        });
      } else {
        console.warn("No hay id_evaluacion disponible, registrando como nueva nota");
        const nuevaEvaluacion = await evaluacionesService.registrarNota({
          idInscripcion: modalCompetidor.id_inscripcion,
          idUsuario,
          nota: data.nota,
          idFase: 2,
          descripcionConceptual: data.descripcionConceptual,
          etica: data.etica,
          comentario: data.comentario,
        });

        // 🔹 Aseguramos que el backend devuelva id_evaluacion
        console.log('Respuesta registrarNota:', nuevaEvaluacion);

        setCompetidores(prev =>
          prev.map(c =>
            c.id_inscripcion === modalCompetidor.id_inscripcion
              ? {
                  ...c,
                  evaluaciones: [
                    {
                      ...(c.evaluaciones?.[0] ?? {}),
                      id_evaluacion: nuevaEvaluacion.id_evaluacion, // ✅ nuevo id
                      nota: data.nota,
                    },
                  ],
                }
              : c
          )
        );
      }


      setModalCompetidor(null);
      setReloadStats(prev => !prev);
    } catch (err) {
      console.error('❌ Error al registrar/editar nota:', err);
      if (hasResponseData(err) && err.response.data) {
        console.error('Backend response:', err.response.data);
      }
    }
  };

  /* ===== Render ===== */
  return (
    <div className="p-6 space-y-6 bg-transparent">
      <h1 className="text-2xl text-black font-bold">Sistema de evaluaciones</h1>

      {/* Cards summary (usa /admin/evaluaciones/resumen) */}
      <CardsSummary key={reloadStats ? 'reload' : 'static'} />

      <div className="flex flex-col gap-3">
        {/* Buscador + Filtros Área/Nivel */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row w-full items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {/* Select Área */}
          <div className="relative w-full sm:w-48">
            {/* ◼ wrapper con borde negro */}
            <div className="relative rounded-lg ring-1 ring-black focus-within:ring-1">
              <select
                className={`h-9 w-full appearance-none rounded-lg bg-transparent px-3 pr-10 text-sm
                  ${idArea == null ? 'text-gray-500' : 'text-black'}
                  focus:outline-none`}
                value={idArea ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') setIdArea(null);         // placeholder
                  else setIdArea(Number(v));             // incluye 0 (todas) o un id
                }}
                aria-label="Filtrar por área"
                disabled={loadingCatalogs}
              >
                <option value="" disabled hidden>Filtrar por área</option>
                <option value={0} style={{ color: '#111827' }}>Todas las áreas</option>
                {areas.map(a => (
                  <option key={`area-${a.id}`} value={a.id} style={{ color: '#111827' }}>{a.nombre}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Select Nivel */}
          <div className="relative w-full sm:w-48">
            {/* ◼ wrapper con borde negro */}
            <div className="relative rounded-lg ring-1 ring-black focus-within:ring-1">
              <select
                className={`h-9 w-full appearance-none rounded-lg bg-transparent px-3 pr-10 text-sm
                  ${idNivel == null ? 'text-gray-500' : 'text-black'}
                  focus:outline-none`}
                value={idNivel ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') setIdNivel(null);         // placeholder
                  else setIdNivel(Number(v));             // incluye 0 (todos) o un id
                }}
                aria-label="Filtrar por nivel"
                disabled={loadingCatalogs}
              >
                <option value="" disabled hidden>Filtrar por nivel</option>
                <option value={0} style={{ color: '#111827' }}>Todos los niveles</option>
                {niveles.map(n => (
                  <option key={`nivel-${n.id}`} value={n.id} style={{ color: '#111827' }}>{n.nombre}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 w-full">
          {/* Tabs de estado */}
          <div className="flex mb-4">
            <FilterTabs
              active={activeFilter}
              onChange={(filter) =>
                setActiveFilter(filter as 'Todos' | 'Pendientes' | 'Evaluados')
              }
            />
          </div>

          {/* Lista de competidores */}
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

      {/* Modal de evaluación */}
      {modalCompetidor && (
        <ModalEvaluacion
          isOpen={!!modalCompetidor}
          onClose={() => setModalCompetidor(null)}
          onSubmit={handleSubmitNota}
          onSaved={() => { fetchCompetidoresClasificados(); }}
          title={`${
            modalCompetidor.evaluaciones?.length > 0
              ? `Editar nota de ${modalCompetidor.competidor.nombres} ${modalCompetidor.competidor.apellidos}`
              : `Evaluar a ${modalCompetidor.competidor.nombres} ${modalCompetidor.competidor.apellidos}`
          }`}
          initialData={
            modalCompetidor.evaluaciones?.[0]
              ? {
                  nota:
                    typeof modalCompetidor.evaluaciones[0].nota === 'number'
                      ? modalCompetidor.evaluaciones[0].nota
                      : undefined,
                  descripcionConceptual:
                    modalCompetidor.evaluaciones[0].descripcionConceptual ?? '',
                  etica: modalCompetidor.evaluaciones[0].etica ?? 'Sí cumple',
                  observaciones: modalCompetidor.evaluaciones[0].observaciones ?? '',
                }
              : undefined
          }
          competidor={{
            nombres: modalCompetidor.competidor.nombres,
            apellidos: modalCompetidor.competidor.apellidos,
            ci: modalCompetidor.competidor.ci,
            colegio: modalCompetidor.competidor.colegio,
            nivel: modalCompetidor.competidor.nivel,
          }}
        />
      )}
    </div>
  );
}
