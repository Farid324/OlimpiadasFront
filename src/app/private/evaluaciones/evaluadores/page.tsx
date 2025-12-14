//src/app/private/evaluaciones/evaluadores/page.tsx
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

type AreaDTO = { id: number; nombre: string };
type NivelDTO = { id: number; nombre: string };

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

async function getAreas(): Promise<AreaDTO[]> {
  const { data } = await api.get('/admin/evaluaciones/mis-areas');
  return mapCatalog<AreaDTO>(data, ['id_area', 'id'], ['nombre_area', 'nombre']);
}
async function getNiveles(): Promise<NivelDTO[]> {
  const { data } = await api.get('/admin/evaluaciones/niveles');
  return mapCatalog<NivelDTO>(data, ['id_nivel', 'id'], ['nombre_nivel', 'nombre']);
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function hasResponseData(x: unknown): x is { response: { data?: unknown } } {
  return isRecord(x) && isRecord(x.response);
}

export default function EvaluacionesEvaluadoresPage() {
  const { setTitle } = usePageHeader();

  const [competidoresFase1, setCompetidoresFase1] = useState<CompetidorInscripcion[]>([]);
  const [competidoresFase2, setCompetidoresFase2] = useState<CompetidorInscripcion[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Pendientes' | 'Evaluados'>('Todos');
  const [modalCompetidor, setModalCompetidor] = useState<CompetidorInscripcion | null>(null);
  const { user } = useAuth();
  const [reloadStats, setReloadStats] = useState(false);
  const [idAreasEval, setIdAreasEval] = useState<number[]>([]);


  const [idArea, setIdArea] = useState<number | null>(null);
  const [idNivel, setIdNivel] = useState<number | null>(null);
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [niveles, setNiveles] = useState<NivelDTO[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const [activeTab, setActiveTab] = useState<'CLASIFICACION' | 'FASE_FINAL'>('CLASIFICACION');

  /* ===== Título ===== */
  useEffect(() => { setTitle('Evaluaciones'); }, [setTitle]);

  // useEffect(() => {
  //   let cancel = false;
  //   (async () => {
  //     try {
  //       setLoadingCatalogs(true);
  //       const [a, n] = await Promise.all([getAreas(), getNiveles()]);
  //       if (!cancel) { setAreas(a); setNiveles(n); }
  //     } finally {
  //       if (!cancel) setLoadingCatalogs(false);
  //     }
  //   })();
  //   return () => { cancel = true; };
  // }, []);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoadingCatalogs(true);
        const [a, n] = await Promise.all([getAreas(), getNiveles()]);

        if (!cancel) {
          setAreas(a);
          setNiveles(n);

          // << Guardar solo IDs para el backend >>
          setIdAreasEval(a.map(x => x.id));
        }
      } finally {
        if (!cancel) setLoadingCatalogs(false);
      }
    })();

    return () => { cancel = true; };
  }, []);


  const fetchCompetidores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await evaluacionesService.listarCompetidores({
        search: searchQuery || undefined,
        filtro:
          activeFilter === 'Pendientes' ? 'PENDIENTE' :
          activeFilter === 'Evaluados' ? 'EVALUADO' : 'TODOS',
        id_area: idArea ?? undefined,
        id_nivel: idNivel ?? undefined,
        idAreas: idAreasEval,
      });
      setCompetidoresFase1(data);
    } finally {
      setLoading(false);
    }
  },[searchQuery, activeFilter, idArea, idNivel, idAreasEval]);

  const fetchCompetidoresClasificados = useCallback(async () => {
    setLoading(true);
    try {
      const data = await evaluacionesService.getListarCompetidoresClasificados({
        search: searchQuery || undefined,
        id_area: idArea ?? undefined,
        id_nivel: idNivel ?? undefined,
        idAreas: idAreasEval,
      });
      setCompetidoresFase2(data);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, idArea, idNivel, idAreasEval]);

  /* ===== Ejecutar fetch según tab activo ===== */
  useEffect(() => {
    const fn = activeTab === 'CLASIFICACION' ? fetchCompetidores : fetchCompetidoresClasificados;
    fn();
  }, [activeTab, fetchCompetidores, fetchCompetidoresClasificados, searchQuery, activeFilter, idArea, idNivel]);

  const doFilter = useCallback((list: CompetidorInscripcion[]) => {
      const term = searchQuery.trim().toLowerCase();
      return list
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
  }, [searchQuery, activeFilter]);

  const filteredCompetidores = useMemo(() => doFilter(competidoresFase1), [competidoresFase1, doFilter]);
  const filteredCompetidoresClasificados = useMemo(() => doFilter(competidoresFase2), [competidoresFase2, doFilter]);

  const dataToRender = activeTab === 'CLASIFICACION' ? filteredCompetidores : filteredCompetidoresClasificados;

  const handleOpenModal = async (competidor: CompetidorInscripcion) => {
    try {
      const evaluacionExistente = competidor.evaluaciones?.[0];
      const idFase = activeTab === 'CLASIFICACION' ? 1 : 2;
      if (activeTab === 'CLASIFICACION' && evaluacionExistente?.estado_registro === 'FIRMADA') {
          console.log('Evaluación FIRMADA. No se puede editar.');
          return;
      }
      
      if (evaluacionExistente?.id_evaluacion) {
        const detalle = await evaluacionesService.getEvaluacion(
          evaluacionExistente.id_evaluacion,
          idFase
        );
        setModalCompetidor({ ...competidor, evaluaciones: [detalle] });
      } else {
        setModalCompetidor(competidor);
      }
    } catch {
      setModalCompetidor(competidor);
    }
  };

  const handleSubmitNota = async (data: {
      nota: number;
      descripConceptual?: string;
      etica?: string;
      comentario?: string;
  }) => {
      if (!modalCompetidor) return;

      try {
          const idUsuario = Number(user?.id);
          const evaluacionExistente = modalCompetidor.evaluaciones?.[0];
          const idFase = activeTab === 'CLASIFICACION' ? 1 : 2;

          if (evaluacionExistente?.id_evaluacion) {
              await evaluacionesService.editarNota({
                  idEvaluacion: evaluacionExistente.id_evaluacion,
                  idUsuario,
                  nuevaNota: data.nota,
                  descripConceptual: data.descripConceptual,
                  comentario: data.comentario,
                  idFase,
              });
          } 
          else { 
              await evaluacionesService.registrarNota({
                  idInscripcion: modalCompetidor.id_inscripcion,
                  idUsuario,
                  nota: data.nota,
                  idFase,
                  descripConceptual: data.descripConceptual,
                  comentario: data.comentario,
              });
          }

          if (activeTab === 'CLASIFICACION') {
              await fetchCompetidores(); 
          } else {
              await fetchCompetidoresClasificados(); 
          }

          setModalCompetidor(null);
          setReloadStats(p => !p);
      } catch (err) {
          if (hasResponseData(err)) console.error(err.response.data);
      }
  };

  /* ===== Render ===== */
  return (
    <div className="p-0 sm:p-6 space-y-6 bg-transparent">
      <h1 className="text-2xl text-black font-bold">Sistema de evaluaciones</h1>

      <div className="flex p-1 bg-gray-100 rounded-full w-full shadow-inner mb-6">
        <button
          onClick={() => setActiveTab('CLASIFICACION')}
          className={`
            flex-1 px-4 py-2 text-center font-medium text-sm rounded-full transition-all duration-200
            ${
              activeTab === 'CLASIFICACION'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-gray-700 hover:bg-white'
            }
          `}
        >
          Clasificación
        </button>
        <button
          onClick={() => setActiveTab('FASE_FINAL')}
          className={`
            flex-1 px-4 py-2 text-center font-medium text-sm rounded-full transition-all duration-200
            ${
              activeTab === 'FASE_FINAL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-gray-700 hover:bg-white'
            }
          `}
        >
          Fase Final
        </button>
      </div>

      {/* Cards summary (usa /admin/evaluaciones/resumen) */}
      <CardsSummary
        key={`${activeTab}-${reloadStats ? 'reload' : 'static'}`}
        idFase={activeTab === 'CLASIFICACION' ? 1 : 2}
        refreshToken={reloadStats}
      />
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

          <div className="w-full overflow-x-auto">
            {loading ? (
              <p className="text-center text-gray-500 py-6">Cargando competidores...</p>
            ) : (
              <CompetidorList
                data={dataToRender}
                onEvaluar={handleOpenModal}
                onEditar={handleOpenModal}
                mostrarNivel
                mostrarEstado
                fase={activeTab}
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
                      : Number(modalCompetidor.evaluaciones[0].nota) || undefined,

                  descripConceptual:
                    modalCompetidor.evaluaciones[0].descripConceptual ??
                    '',

                  comentario:
                    modalCompetidor.evaluaciones[0].comentario ?? '',
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
