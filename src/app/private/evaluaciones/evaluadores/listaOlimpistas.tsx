//src/app/private/evaluaciones/evaluadores/listaOlimpistas.tsx
'use client';
import { useMemo, useState } from 'react';
import { CompetidorInscripcion } from '@/types/notas';
import { Button } from '@/components/ui/Button';

/* ====== Tipos auxiliares para evitar any ====== */

type CompetidorConPosicion = CompetidorInscripcion & {
  posicion?: number | null;
  orden?: number | null;
  evaluaciones?: Array<
    | {
        posicion?: number | null;
        nota?: number | string | null;
      }
    | null
  >;
};

type CompetidorConId = CompetidorInscripcion & {
  competidor?: {
    id_competidor?: string | number | null;
    ci?: string | null;
    nombres?: string;
    apellidos?: string;
    escuela?: string;
  };
};

type CompetidorConNota = CompetidorInscripcion & {
  evaluaciones?: Array<
    | {
        nota?: number | string | null;
      }
    | null
  >;
};

/* ====== Icono de orden (igual estilo del ejemplo) ====== */
function SortPosIconDual({ asc, className }: { asc: boolean; className?: string }) {
  const active = '#1a73e8';
  const inactive = '#cbd5e1';
  const strokeW = 2;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      {/* Descendente */}
      <g stroke={asc ? inactive : active} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v14" />
        <path d="M4 16l3 3 3-3" />
      </g>
      {/* Ascendente */}
      <g stroke={asc ? active : inactive} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21V7" />
        <path d="M14 10l3-3 3 3" />
      </g>
    </svg>
  );
}

interface Props {
  data: CompetidorInscripcion[];
  onEvaluar: (c: CompetidorInscripcion) => void;
  onEditar: (c: CompetidorInscripcion) => void;
  mostrarNivel?: boolean;
  mostrarEstado?: boolean;
  fase: 'CLASIFICACION' | 'FASE_FINAL'; 
}

/** Fallback por si algún día traes posición persistida desde BE */
function getPosicionPersistida(c: CompetidorInscripcion, fallbackIndex: number): number {
  const cc = c as CompetidorConPosicion;

  const fromEval = cc.evaluaciones?.[0]?.posicion;
  const p =
    cc.posicion ??
    cc.orden ??
    (typeof fromEval === 'number' ? fromEval : undefined);

  return typeof p === 'number' && !Number.isNaN(p) ? p : fallbackIndex + 1;
}

/* ================== Helpers para ranking por NOTA ================== */

function getCompetidorId(c: CompetidorInscripcion, idx: number): string | number {
  const cc = c as CompetidorConId;
  const id = cc.competidor?.id_competidor;

  if (id !== undefined && id !== null) return id;
  const ci = cc.competidor?.ci ?? 'row';
  return `${ci}-${idx}`;
}

function getNota(c: CompetidorInscripcion): number | null {
  const cc = c as CompetidorConNota;
  const raw = cc.evaluaciones?.[0]?.nota;
  const n = raw === null || raw === undefined ? null : Number(raw);

  if (n === null || !Number.isFinite(n)) return null;
  if (n === -1) return Number.NEGATIVE_INFINITY;
  return n;
}

function buildDynamicPositionMap(rows: CompetidorInscripcion[]): Map<string | number, number> {
  const enriched = rows.map((item, idx) => ({
    id: getCompetidorId(item, idx),
    nota: getNota(item),
    idx,
  }));

  enriched.sort((a, b) => {
    const aHas = a.nota !== null;
    const bHas = b.nota !== null;
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    if (aHas && bHas) {
      if (b.nota! !== a.nota!) return b.nota! - a.nota!;
      return a.idx - b.idx;
    }
    return a.idx - b.idx;
  });

  const map = new Map<string | number, number>();
  enriched.forEach((r, i) => map.set(r.id, i + 1));
  return map;
}

export default function CompetidorList({
  data,
  onEvaluar,
  onEditar,
  mostrarNivel,
  mostrarEstado,
  fase,
}: Props) {
  const [orderAsc, setOrderAsc] = useState<boolean>(true);

  const posMap = useMemo(() => buildDynamicPositionMap(data), [data]);

  const rows = useMemo(() => {
    const projected = data.map((item, idx) => {
      const id = getCompetidorId(item, idx);
      const dyn = posMap.get(id);
      const pos = typeof dyn === 'number' ? dyn : getPosicionPersistida(item, idx);
      return { item, idx, pos };
    });
    projected.sort((a, b) => (orderAsc ? a.pos - b.pos : b.pos - a.pos) || a.idx - b.idx);
    return projected;
  }, [data, posMap, orderAsc]);

  return (
    <div className="w-full">
      {data.length === 0 ? (
        <p className="text-gray-400 text-center mt-6">No hay registros.</p>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setOrderAsc(v => !v)}
              aria-pressed={orderAsc}
              aria-label={orderAsc ? 'Ordenar posición descendente' : 'Ordenar posición ascendente'}
              title={orderAsc ? 'Posición ↓' : 'Posición ↑'}
              className="inline-flex items-center justify-center rounded-md p-2 cursor-pointer select-none focus:outline-none focus-visible:outline-none"
              data-testid="btn-sort-pos"
            >
              <SortPosIconDual asc={orderAsc} className="w-7 h-7" />
            </button>
          </div>

          <table className="w-full mt-2 border-collapse text-sm">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-300">
              <tr className="text-gray-700">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Olimpista</th>
                <th className="p-2 text-center">CI</th>
                <th className="p-2 text-center">Colegio</th>
                <th className="p-2 text-center">Área</th>
                {mostrarNivel && <th className="p-2 text-center">Nivel</th>}
                <th className="p-2 text-center">Nota</th>
                {/* {mostrarEstado && <th className="p-2 text-center">Clasificación</th>} */}
                {mostrarEstado && (
                  <th className="p-2 text-center">
                    {fase === 'FASE_FINAL' ? 'Aprobación' : 'Clasificación'}
                  </th>
                )}
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>


            <tbody>
              {rows.map(({ item: c, pos }, i) => {
                const nota = c.evaluaciones?.[0]?.nota ?? null;
                const nivel = c.nivel?.nombre_nivel ?? '—';

                // ================== NUEVO: ÁREA ==================
                const area = c.area?.nombre_area || c.area?.nombre || '—';

                // ================== NUEVO: CLASIFICACIÓN ==================
                // let estado: string;

                // if (!c.evaluaciones || c.evaluaciones.length === 0) {
                //   estado = 'SIN_EVALUACION';
                // } else if (c.clasificacion === 'CLASIFICADO') {
                //   estado = 'CLASIFICADO';
                // } else if (c.clasificacion === 'NO_CLASIFICADO') {
                //   estado = 'NO_CLASIFICADO';
                // } else if (c.clasificacion === 'DESCALIFICADO') {
                //   estado = 'DESCALIFICADO';
                // } else {
                //   estado = 'SIN_EVALUACION';
                // }

                let estado: string;

                if (fase === 'FASE_FINAL') {
                  if (!c.evaluaciones || c.evaluaciones.length === 0) {
                    estado = 'NO_EVALUADO';
                  } else {
                    estado = c.estado_final ?? 'NO_EVALUADO';
                  }
                } else {
                  if (!c.evaluaciones || c.evaluaciones.length === 0) {
                    estado = 'SIN_EVALUACION';
                  } else if (c.clasificacion === 'CLASIFICADO') {
                    estado = 'CLASIFICADO';
                  } else if (c.clasificacion === 'NO_CLASIFICADO') {
                    estado = 'NO_CLASIFICADO';
                  } else if (c.clasificacion === 'DESCALIFICADO') {
                    estado = 'DESCALIFICADO';
                  } else {
                    estado = 'SIN_EVALUACION';
                  }
                }

                const chipStyle =
                estado === 'CLASIFICADO' || estado === 'APROBADO'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : estado === 'NO_CLASIFICADO' || estado === 'NO_APROBADO'
                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                  : estado === 'DESCALIFICADO'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-yellow-100 text-yellow-700 border-yellow-300';

                const firmada =
                  fase === 'CLASIFICACION' &&
                  c.evaluaciones?.[0]?.estado_registro === 'FIRMADA';

                return (
                  <tr
                    key={c.competidor.id_competidor ?? i}
                    className={`border-b border-gray-200 transition-colors group relative ${
                      firmada ? 'opacity-60 hover:bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="p-2 text-center text-black font-semibold">{pos}</td>

                    <td className="p-2 text-black font-semibold">
                      {c.competidor.nombres} {c.competidor.apellidos}
                    </td>

                    <td className="p-2 text-center text-black font-semibold">{c.competidor.ci}</td>

                    <td className="p-2 text-center text-black">{c.competidor.escuela}</td>

                    <td className="p-2 text-center text-black">
                      {area}
                    </td>

                    {mostrarNivel && (
                      <td className="p-2 text-center text-black">
                        <span className="inline-block text-xs bg-blue-100 text-blue-700 border border-blue-300 px-2 py-0.5 rounded-md font-bold">
                          {nivel}
                        </span>
                      </td>
                    )}

                    <td className="p-2 text-center text-black font-medium">
                      {nota !== null ? nota : '—'}
                    </td>

                    {mostrarEstado && (
                      <td className="p-2 text-center">
                        <span
                          className={`inline-block text-xs border px-2 py-0.5 rounded-md font-bold ${chipStyle}`}
                        >
                          {fase === 'FASE_FINAL'
                            ? estado === 'APROBADO'
                              ? 'Aprobado'
                              : estado === 'NO_APROBADO'
                              ? 'No aprobado'
                              : estado === 'DESCALIFICADO'
                              ? 'Descalificado'
                              : 'No evaluado'
                            : estado === 'CLASIFICADO'
                            ? 'Clasificado'
                            : estado === 'NO_CLASIFICADO'
                            ? 'No clasificado'
                            : estado === 'DESCALIFICADO'
                            ? 'Descalificado'
                            : 'Sin evaluación'}
                        </span>
                      </td>
                    )}

                    <td className="p-2 flex justify-center gap-2 relative">
                      {!nota ? (
                        <Button
                          onClick={() => onEvaluar(c)}
                          size="sm"
                          className={`rounded-md shadow-sm transition-colors ${
                            firmada
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
                              : 'bg-blue-800 hover:bg-blue-950 text-white'
                          }`}
                          disabled={firmada}
                        >
                          Evaluar
                        </Button>
                      ) : (
                        <Button
                          onClick={() => onEditar(c)}
                          size="sm"
                          variant="outline"
                          className={`rounded-md shadow-sm ${
                            firmada
                              ? 'border-gray-300 text-gray-900 cursor-not-allowed bg-gray-100'
                              : 'border-gray-400 text-gray-700 hover:bg-gray-300 hover:border-gray-500 hover:text-gray-900'
                          }`}
                          disabled={firmada}
                        >
                          Editar
                        </Button>
                      )}

                      {firmada && (
                        <div
                          className="absolute bottom-full mb-1 hidden group-hover:block
                                    bg-gray-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap
                                    left-1/2 -translate-x-1/2"
                        >
                          Fase cerrada
                          <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-gray-800 rotate-45 -translate-x-1/2"></div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </>
      )}
    </div>
  );
}
