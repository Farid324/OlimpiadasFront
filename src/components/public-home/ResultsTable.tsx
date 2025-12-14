// src/components/public-home/ResultsTable.tsx (CORREGIDO)

import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

import { CompetitorData, ActiveTab } from '@/types/principal';
import { ActivePhase } from '@/app/page';

interface ResultsTableProps {
  filteredCompetitors?: CompetitorData[];
  getMedalColor: (medal: string | null) => string;
  activeTab: ActiveTab;
  activePhase: ActivePhase;
}

function prettyPrize(m?: string | null) {
  if (!m) return null;
  const up = String(m).toUpperCase();

  if (up === 'ORO') return 'Medalla de Oro';
  if (up === 'PLATA' || up === 'PLATA_PREMIADO') return 'Medalla de Plata';
  if (up === 'BRONCE' || up === 'BRONCE_PREMIADO') return 'Medalla de Bronce';
  if (up === 'MENCION') return 'Mención';

  // si el back ya manda texto tipo "Medalla de Oro", "Mención", etc.
  return m;
}

function getNivel(competitor: any): string | null {
  // soporta varios nombres posibles según cómo venga del back
  return (
    competitor?.nivel ??
    competitor?.level ??
    competitor?.nombreNivel ??
    competitor?.nivel_nombre ??
    null
  );
}

function getMedalRaw(competitor: any): string | null {
  // soporta varios nombres posibles según cómo venga del back
  return (
    competitor?.medal ??
    competitor?.medalla ??
    competitor?.estadoPremio ??
    competitor?.premioTipo ??
    null
  );
}

function getPrizeLabel(competitor: any): string | null {
  // Si el back manda "premio" ya listo (Medalla de Oro / Mención), lo usamos.
  // Si no, lo inferimos desde medalRaw.
  return competitor?.premio ?? prettyPrize(getMedalRaw(competitor));
}

// EXPORT NOMBRADO (para que tu import { ResultsTable } funcione)
export function ResultsTable({
  filteredCompetitors,
  getMedalColor,
  activeTab,
  activePhase,
}: ResultsTableProps) {
  const rows = Array.isArray(filteredCompetitors) ? filteredCompetitors : [];

  // Histórico: columna Medalla
  const showHistoricalMedal = activeTab === 'historical';

  // Current + fase2: columna Premio (Medalla/Mención)
  const showFinalPrize = activeTab === 'current' && activePhase === 'fase2';

  // ColSpan dinámico
  const baseCols = 9; // #, Nombre, CI, Área, Nivel, Colegio, Ciudad, Año, Puntaje
  const extraCols = (showHistoricalMedal ? 1 : 0) + (showFinalPrize ? 1 : 0);
  const colSpan = baseCols + extraCols;

  return (
    <div className="border-1 border-[var(--bordeGris)] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-[var(--blancoGrisOscuro)] font-bold">
              <TableHead className="w-12 font-semibold">#</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Nombre</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">CI</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Área</TableHead>

              {/* SIEMPRE */}
              <TableHead className="font-semibold whitespace-nowrap">Nivel</TableHead>

              <TableHead className="font-semibold whitespace-nowrap">Colegio</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Ciudad</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Año</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Puntaje</TableHead>

              {/* Histórico */}
              {showHistoricalMedal && (
                <TableHead className="font-semibold whitespace-nowrap">Medalla</TableHead>
              )}

              {/* Current fase2 */}
              {showFinalPrize && (
                <TableHead className="font-semibold whitespace-nowrap">Premio</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-8 text-gray-500">
                  No se encontraron competidores con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              rows.map((competitor: any, index: number) => {
                const nivel = getNivel(competitor);
                const medalRaw = getMedalRaw(competitor); // 'ORO'|'PLATA'|'BRONCE'|'MENCION'|...
                const prizeLabel = getPrizeLabel(competitor); // 'Medalla de Oro'|'Mención'|...
                const medalLabel = prettyPrize(medalRaw);

                return (
                  <TableRow
                    key={competitor?.id ?? `${competitor?.ci ?? 'row'}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-[var(--negro)]">
                      {index + 1}
                    </TableCell>

                    <TableCell className="font-medium text-[var(--negro)] whitespace-nowrap">
                      {competitor?.name ?? 'N/A'}
                    </TableCell>

                    <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">
                      {competitor?.ci ?? 'N/A'}
                    </TableCell>

                    <TableCell>
                      <Badge className="text-sm text-[var(--negro)] whitespace-nowrap" variant="outline">
                        {competitor?.area ?? 'N/A'}
                      </Badge>
                    </TableCell>

                    {/* NIVEL */}
                    <TableCell>
                      <Badge className="text-sm text-[var(--negro)] whitespace-nowrap" variant="outline">
                        {nivel ?? 'N/A'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">
                      {competitor?.school ?? 'N/A'}
                    </TableCell>

                    <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">
                      {competitor?.city ?? 'N/A'}
                    </TableCell>

                    <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">
                      {competitor?.year ?? 'N/A'}
                    </TableCell>

                    <TableCell className="font-semibold text-[var(--negro)] whitespace-nowrap">
                      {competitor?.score !== null && competitor?.score !== undefined
                        ? Number(competitor.score).toFixed(2)
                        : 'N/A'}
                    </TableCell>

                    {/* Histórico: Medalla */}
                    {showHistoricalMedal && (
                      <TableCell>
                        <Badge className={getMedalColor(medalRaw ?? null)}>
                          {medalLabel ?? 'N/A'}
                        </Badge>
                      </TableCell>
                    )}

                    {/* Current fase2: Premio */}
                    {showFinalPrize && (
                      <TableCell>
                        <Badge className={getMedalColor(medalRaw ?? null)}>
                          {prizeLabel ?? 'N/A'}
                        </Badge>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// DEFAULT EXPORT (por si en algún punto importas default sin llaves)
export default ResultsTable;
