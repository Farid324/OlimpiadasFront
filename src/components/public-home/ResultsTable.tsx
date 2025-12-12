// Ruta: src/components/public-home/ResultsTable.tsx (FINAL)

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
  filteredCompetitors: CompetitorData[];
  getMedalColor: (medal: string | null) => string;
  activeTab: ActiveTab;
  activePhase: ActivePhase;
}

export function ResultsTable({ 
  filteredCompetitors, 
  getMedalColor, 
  activeTab, 
  activePhase 
}: ResultsTableProps) {
  
  const isFaseClasificatoria = activeTab === 'current' && activePhase === 'fase1';
  const colSpanCount = isFaseClasificatoria ? 8 : 9;

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
              <TableHead className="font-semibold whitespace-nowrap">Colegio</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Ciudad</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Año</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Puntaje</TableHead>
              
              {!isFaseClasificatoria && (
                <TableHead className="font-semibold whitespace-nowrap">Medalla</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompetitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpanCount} className="text-center py-8 text-gray-500">
                  No se encontraron competidores con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              filteredCompetitors.map((competitor, index) => (
                // 🛑 CORRECCIÓN DE KEY: Usamos competitor.id con fallback al index
                <TableRow key={competitor.id ? competitor.id : index} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-[var(--negro)]">{index + 1}</TableCell>
                  <TableCell className="font-medium text-[var(--negro)] whitespace-nowrap">{competitor.name}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">{competitor.ci}</TableCell>
                  <TableCell>
                    <Badge className="text-sm text-[var(--negro)] whitespace-nowrap" variant="outline">{competitor.area}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">{competitor.school}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">{competitor.city}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">{competitor.year}</TableCell>
                  
                  <TableCell className="font-semibold text-[var(--negro)] whitespace-nowrap">
                    {competitor.score !== null && competitor.score !== undefined ? competitor.score.toFixed(2) : 'N/A'}
                  </TableCell>
                  
                  {!isFaseClasificatoria && (
                    <TableCell>
                      <Badge className={getMedalColor(competitor.medal)}>{competitor.medal ?? 'N/A'}</Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}