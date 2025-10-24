// src/app/private/evaluaciones/evaluadores/page.tsx
'use client';
import { useEffect, useState, useMemo} from 'react';
import { usePageHeader } from '@/contexts/pageHeader';

import { api } from '@/libs/api';

import CardsSummary from '@/components/evaluador/cards';
import SearchBar from '@/components/evaluador/buscador';
import FilterTabs from '@/components/evaluador/filtros';
import CompetidorList from '@/components/evaluador/listaOlimpistas';
import ModalEvaluacion from '@/components/evaluador/modalEvaluacion';
//import { Competidor } from '@/types/notas';

type ConstraintItem = { constraints?: Record<string, string> };
type Competidor = {
  id_competidor: number;
  nombres: string;
  apellidos: string;
  ci: string;
  escuela: string;
  nota?: number | null;
  inscripcion?: number;
};


type BackendErrorResponse =
  | {
      message?: string | string[];
      errors?: string[];
    }
  | ConstraintItem[]
  | string
  | null
  | undefined;

/** Type guards mínimos y seguros */
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

/** Lee mensajes de error de Axios/Nest/Prisma de forma robusta */
function getBackendError(err: unknown): string {
  const apiData: BackendErrorResponse | undefined = hasResponseData(err)
    ? (err.response.data as BackendErrorResponse | undefined)
    : undefined;

  // message: string
  if (isRecord(apiData) && typeof apiData.message === 'string') return apiData.message;

  // message: string[]
  if (isRecord(apiData) && isStringArray(apiData.message)) return apiData.message.join(', ');

  // errors: string[]
  if (isRecord(apiData) && isStringArray(apiData.errors)) return apiData.errors.join(', ');

  // [{ constraints: {...} }, ...] (class-validator típicamente)
  if (isConstraintArray(apiData)) {
    const msgs = apiData
      .flatMap((e: ConstraintItem) => (e.constraints ? Object.values(e.constraints) : []))
      .filter((t): t is string => typeof t === 'string' && t.length > 0);
    if (msgs.length) return msgs.join(', ');
  }

  // data como string plano
  if (typeof apiData === 'string') return apiData;

  // fallback a Error.message si lo es
  if (err instanceof Error && err.message) return String(err.message);

  return 'No se pudo registrar (revisa conexión, token o duplicados).';
}


export default function EvaluacionesEvaluadoresPage() {
  const { setTitle } = usePageHeader();
  useEffect(() => {
    setTitle('Evaluaciones');
  }, [setTitle]);

  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Pendientes' | 'Evaluados'>('Todos');

  const [modalCompetidor, setModalCompetidor] = useState<Competidor | null>(null);

  // ===== Fetch competidores asignados =====
  const fetchCompetidores = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/evaluaciones/mis-competidores');
      setCompetidores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetidores();
  }, []);

  // ===== Filtrado + búsqueda =====
  const filteredCompetidores = useMemo(() => {
  return competidores
    ?.filter(c => {
      if (activeFilter === 'Pendientes') return c.nota === null;
      if (activeFilter === 'Evaluados') return c.nota !== null;
      return true;
    })
    ?.filter(c => {
      const term = searchQuery?.toLowerCase() ?? '';
      return (
        (c?.nombres?.toLowerCase() ?? '').includes(term) ||
        (c?.apellidos?.toLowerCase() ?? '').includes(term) ||
        (c?.ci?.toLowerCase() ?? '').includes(term) ||
        (c?.escuela?.toLowerCase() ?? '').includes(term)
      );
    }) ?? [];
}, [competidores, searchQuery, activeFilter]);


  // ===== Registrar nota =====
  const handleSubmitNota = async (nota: number) => {
    if (!modalCompetidor) return;

    try {
      await api.post('/admin/evaluaciones/nota', {
        idInscripcion: modalCompetidor.inscripcion,
        nota,
      });
      setModalCompetidor(null);
      fetchCompetidores(); // refrescar lista
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panel de Evaluador</h1>

      {/* Cards */}
      <CardsSummary />

      {/* Buscador + filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar onSearch={setSearchQuery} />
        <FilterTabs active={activeFilter} 
        onChange={(filter) => setActiveFilter(filter as 'Todos' | 'Pendientes' | 'Evaluados')} />
      </div>

      {/* Lista de competidores */}
      {loading ? (
        <p>Cargando competidores...</p>
      ) : (
        <CompetidorList
          data={filteredCompetidores}
          onEvaluar={c => setModalCompetidor(c)}
          onEditar={c => setModalCompetidor(c)}
        />
      )}

      {/* Modal de evaluación */}
      {modalCompetidor && (
        <ModalEvaluacion
          competidor={modalCompetidor}
          onClose={() => setModalCompetidor(null)}
          onSubmit={handleSubmitNota}
        />
      )}
    </div>
  );
      {/* {modalEditar && (
        <ModalEditarNota
          evaluacion={modalEditar}
          onClose={() => setModalEditar(null)}
          onSuccess={fetchCompetidores}
        />
      )} */
}
}
