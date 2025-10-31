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
  const [modalCompetidor, setModalCompetidor] = useState<CompetidorInscripcion | null>(null);
  const { user } = useAuth();
  const [reloadStats, setReloadStats] = useState(false);
  console.log("userID:", user?.id)

  useEffect(() => {
    setTitle('Evaluaciones');
  }, [setTitle]);

  // ==========================================================
  // ✅ Fetch competidores asignados (useCallback evita warning de deps)
  // ==========================================================
  // const fetchCompetidores = useCallback(async (): Promise<CompetidorInscripcion[]> => {
  //   setLoading(true);
  //   try {
  //     const data = await evaluacionesService.listarCompetidores({
  //       search: searchQuery || undefined,
  //       filtro:
  //         activeFilter === 'Pendientes'
  //           ? 'PENDIENTE'
  //           : activeFilter === 'Evaluados'
  //           ? 'EVALUADO'
  //           : 'TODOS',
  //     });
  //     console.log('📦 Datos de competidores:', data);
  //     setCompetidores(data);
  //     setCompetidores(data);
  //     return data; // 🔹 retorna la data
  //   } catch (err) {
  //     console.error('Error al cargar competidores:', getBackendError(err));
  //     return []; // 🔹 retornar array vacío si hay error
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [searchQuery, activeFilter]);


  // useEffect(() => {
  //   fetchCompetidores();
  // }, [fetchCompetidores]);
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
      console.error('Error al cargar competidores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);
  
  const filteredCompetidores = useMemo(() => {
  const term = searchQuery.trim().toLowerCase();

  return competidores
    .filter((c) => {
      const nota = c.evaluaciones?.[0]?.nota ?? null;

      if (activeFilter === 'Pendientes') return nota === null;
      if (activeFilter === 'Evaluados') return nota !== null;
      return true; // 'Todos'
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


  useEffect(() => {
    fetchCompetidores();
  }, [fetchCompetidores]);

  // ==========================================================
  // ✅ Registrar / editar nota
  // ==========================================================
  const handleSubmitNota = async (data: {
    nota: number;
    descripcionConceptual?: string;
    etica?: string;
    observaciones?: string;
  }) => {
    if (!modalCompetidor) return;

    try {
      const idUsuario = Number(user?.id); // 👈 asegura que sea number
      const evaluacionExistente = modalCompetidor.evaluaciones?.[0]; // 👈 tu modelo tiene evaluaciones[]

      if (evaluacionExistente) {
        // 🟡 EDITAR nota existente
        const idEvaluacion = evaluacionExistente.id_evaluacion;
        if (!idEvaluacion) {
          console.warn('⚠️ La evaluación no tiene id_evaluacion, se omitió la edición.');
          return;
        }

        await evaluacionesService.editarNota({
          idEvaluacion,
          idUsuario,
          nuevaNota: data.nota,
          observaciones: data.observaciones,
        });

        // 🧠 Actualiza el competidor localmente
        setCompetidores(prev =>
          prev.map(c =>
            c.id_inscripcion === modalCompetidor.id_inscripcion
              ? { 
                  ...c, 
                  evaluaciones: [
                    { ...(c.evaluaciones?.[0] ?? {}), nota: data.nota }
                  ],
                }
              : c
          )
        );

      } else {
        // 🟢 REGISTRAR nueva nota
        await evaluacionesService.registrarNota({
          idInscripcion: modalCompetidor.id_inscripcion,
          idUsuario,
          nota: data.nota,
          descripcionConceptual: data.descripcionConceptual,
          etica: data.etica,
          observaciones: data.observaciones,
        });

        // 🔁 Refresca o actualiza lista local
        setCompetidores(prev =>
          prev.map(c =>
            c.id_inscripcion === modalCompetidor.id_inscripcion
              ? { 
                  ...c, 
                  evaluaciones: [
                    { ...(c.evaluaciones?.[0] ?? {}), nota: data.nota }
                  ],
                }
              : c
          )
        );

      }

      // ✅ Cierra modal
      setModalCompetidor(null);
      setReloadStats(prev => !prev);
    } catch (err) {
      console.error("❌ Error al registrar/editar nota:", err);
      if (hasResponseData(err) && err.response.data) {
        // Dentro de este 'if', TypeScript ya sabe que 'err.response.data' existe.
        console.error("Backend response:", err.response.data);
      }
    }
  };

  // ==========================================================
  // ✅ Render
  // ==========================================================
  return (
    <div className="p-6 space-y-6 bg-transparent">
      <h1 className="text-2xl font-bold">Sistema de evaluaciones</h1>
      {/* <p className="text-sm text-gray-500">
        Evaluador: 
      </p>
      <p className="text-sm text-gray-500 -mt-4">
        Área: 
      </p> */}

      <CardsSummary key={reloadStats ? 'reload' : 'static'}/>


      <div className="flex flex-col gap-3">
        {/* 🔍 Buscador + SelectBox */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row w-full items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          <div className="w-full sm:w-40">
            <select
              value={activeFilter}
              onChange={(e) =>
                setActiveFilter(e.target.value as 'Todos' | 'Pendientes' | 'Evaluados')
              }
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-700 text-sm
              focus:outline-none focus:ring-0 focus:border-gray-400 hover:border-gray-400 transition-colors cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Pendientes">Pendientes</option>
              <option value="Evaluados">Evaluados</option>
            </select>
          </div>
        </div>


        <div className="bg-white rounded-lg shadow p-4 w-full">
          {/* 🔹 Filtros de estado (Tabs) */}
          <div className="flex mb-4">
            <FilterTabs
              active={activeFilter}
              onChange={(filter) =>
                setActiveFilter(filter as 'Todos' | 'Pendientes' | 'Evaluados')
              }
            />
          </div>

          {/* 🔹 Lista de competidores */}
          <div className="w-full overflow-x-auto">
            {loading ? (
              <p className="text-center text-gray-500 py-6">Cargando competidores...</p>
            ) : (
              <CompetidorList
                data={filteredCompetidores}
                onEvaluar={(ci) => setModalCompetidor(ci)}
                onEditar={(ci) => setModalCompetidor(ci)}
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
          onSaved={() => {
            fetchCompetidores(); // 🔄 actualiza lista
          }}
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
