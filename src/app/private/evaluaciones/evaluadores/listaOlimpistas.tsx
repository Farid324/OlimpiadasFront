'use client';
import { useMemo, useState } from 'react';
import { CompetidorInscripcion } from '@/types/notas';
import { Button } from '@/components/ui/Button';

/* ====== Icono de orden (igual estilo del ejemplo) ====== */
function SortPosIconDual({ asc, className }: { asc: boolean; className?: string }) {
  const active = '#1a73e8';
  const inactive = '#cbd5e1';
  const strokeW = 2;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      {/* Descendente (flecha abajo) */}
      <g stroke={asc ? inactive : active} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v14" />
        <path d="M4 16l3 3 3-3" />
      </g>
      {/* Ascendente (flecha arriba) */}
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
}

/** --- (se mantiene) fallback si alguna vez necesitas leer una posición persistida --- */
function getPosicion(c: CompetidorInscripcion, fallbackIndex: number): number {
  const fromEval = (c as any)?.evaluaciones?.[0]?.posicion;
  const p =
    (c as any)?.posicion ??
    (c as any)?.orden ??
    (typeof fromEval === 'number' ? fromEval : undefined);
  return typeof p === 'number' && !Number.isNaN(p) ? p : fallbackIndex + 1;
}

/* ================== NUEVO: helpers robustos para ranking por NOTA ================== */

/** Id estable del competidor (usa id_competidor o, de fallback, el CI+índice) */
function getCompetidorId(c: CompetidorInscripcion, idx: number): string | number {
  const id = (c as any)?.competidor?.id_competidor;
  if (id !== undefined && id !== null) return id;
  const ci = (c as any)?.competidor?.ci ?? 'row';
  return `${ci}-${idx}`;
}

/** Nota numérica robusta:
 * - Acepta string o number
 * - Si no hay nota => null (queda al final)
 * - Si es -1 (descalificado) => -Infinity (más bajo que cualquier nota)
 */
function getNota(c: CompetidorInscripcion): number | null {
  const raw = (c as any)?.evaluaciones?.[0]?.nota;
  const n = raw === null || raw === undefined ? null : Number(raw);
  if (n === null || !Number.isFinite(n)) return null;
  if (n === -1) return Number.NEGATIVE_INFINITY;
  return n;
}

/**
 * Construye un mapa id -> posición (1..N) calculada por NOTA (desc).
 * Empates se resuelven por índice natural para que sea estable.
 * Los sin nota van al final, también numerados (1..N global).
 */
function buildDynamicPositionMap(rows: CompetidorInscripcion[]): Map<string | number, number> {
  const enriched = rows.map((item, idx) => ({
    id: getCompetidorId(item, idx),
    nota: getNota(item),
    idx,
  }));

  // Orden por: (1) tiene nota primero, (2) nota desc, (3) índice asc
  enriched.sort((a, b) => {
    const aHas = a.nota !== null;
    const bHas = b.nota !== null;
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    if (aHas && bHas) {
      if (b.nota! !== a.nota!) return (b.nota! - a.nota!);
      return a.idx - b.idx;
    }
    return a.idx - b.idx;
  });

  // Asignar posiciones 1..N según el orden resultante
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
}: Props) {
  // true = se ve 1,2,3,... (mayores notas primero porque pos=1 es la mayor)
  const [orderAsc, setOrderAsc] = useState<boolean>(true);

  // Calcula posiciones por nota cada vez que cambie `data`
  const posMap = useMemo(() => buildDynamicPositionMap(data), [data]);

  // Orden estable por posición (derivada del ranking de notas)
  const sorted = useMemo(() => {
    const withIdx = data.map((item, idx) => {
      const id = getCompetidorId(item, idx);
      const dynPos = posMap.get(id);
      const pos = typeof dynPos === 'number' ? dynPos : getPosicion(item, idx);
      return { item, idx, pos };
    });

    // orderAsc=true → 1..N (mayores notas arriba); false → N..1
    withIdx.sort((a, b) => (orderAsc ? a.pos - b.pos : b.pos - a.pos) || a.idx - b.idx);
    return withIdx;
  }, [data, orderAsc, posMap]);

  if (!data.length)
    return <p className="text-gray-400 text-center mt-6">No hay registros.</p>;

  return (
    <div className="w-full">
      {/* Toolbar (se mantiene, solo alterna la dirección visual si lo deseas) */}
      <div className="mb-2 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setOrderAsc((v) => !v)}
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
            {mostrarNivel && <th className="p-2 text-center">Nivel</th>}
            <th className="p-2 text-center">Nota</th>
            {mostrarEstado && <th className="p-2 text-center">Clasificación</th>}
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map(({ item: c, pos }, i) => {
            const nota = (c as any)?.evaluaciones?.[0]?.nota ?? null;
            const nivel = (c as any)?.nivel?.nombre_nivel ?? '—';
            const clasificacion = (c as any)?.clasificacion ?? '—';

            const chipClasificacionStyle =
              clasificacion === 'CLASIFICADO'
                ? 'bg-green-100 text-green-700 border-green-300'
                : clasificacion === 'DESCALIFICADO'
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-gray-100 text-gray-600 border-gray-300';

            return (
              <tr
                key={(c as any)?.competidor?.id_competidor ?? i}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Posición 1..N basada en la NOTA (ranking dinámico) */}
                <td className="p-2 text-center text-black tabular-nums">{pos}</td>
                <td className="p-2 text-black font-medium">
                  {(c as any)?.competidor?.nombres} {(c as any)?.competidor?.apellidos}
                </td>
                <td className="p-2 text-center text-black">{(c as any)?.competidor?.ci}</td>
                <td className="p-2 text-center text-black">{(c as any)?.competidor?.escuela}</td>

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
                      className={`inline-block text-xs border px-2 py-0.5 rounded-md font-bold ${chipClasificacionStyle}`}
                    >
                      {clasificacion}
                    </span>
                  </td>
                )}

                <td className="p-2 flex justify-center gap-2">
                  {nota === null ? (
                    <Button
                      onClick={() => onEvaluar(c)}
                      size="sm"
                      className="bg-blue-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors"
                    >
                      Evaluar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onEditar(c)}
                      size="sm"
                      variant="outline"
                      className="border-gray-500 text-gray-600 hover:bg-indigo-50 transition-colors rounded-md shadow-sm"
                    >
                      Editar
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
