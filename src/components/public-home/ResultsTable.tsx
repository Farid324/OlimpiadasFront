// Ruta: src/components/public-home/ResultsTable.tsx

import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { CompetitorData } from '@/types/principal'; // Importa el tipo

interface ResultsTableProps {
  filteredCompetitors: CompetitorData[];
  getMedalColor: (medal: string) => string;
}

export function ResultsTable({ filteredCompetitors, getMedalColor }: ResultsTableProps) {
  return (
    <div className="border-1 border-[var(--bordeGris)] rounded-lg overflow-hidden ">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {/* CORREGIDO: Sin espacios extra dentro */}
            <TableRow className="bg-[var(--blancoGrisOscuro)] font-bold">
              <TableHead className="w-12 font-semibold">#</TableHead>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">CI</TableHead>
              <TableHead className="font-semibold">Área</TableHead>
              <TableHead className="font-semibold">Colegio</TableHead>
              <TableHead className="font-semibold">Ciudad</TableHead>
              <TableHead className="font-semibold">Año</TableHead>
              <TableHead className="font-semibold">Puntaje</TableHead>
              <TableHead className="font-semibold">Medalla</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className=''>
            {filteredCompetitors.length === 0 ? (
              // CORREGIDO: Sin espacios extra dentro
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">No se encontraron competidores con los filtros seleccionados</TableCell>
              </TableRow>
            ) : (
              filteredCompetitors.map((competitor, index) => (
                // CORREGIDO: Sin espacios extra dentro
                <TableRow key={competitor.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-[var(--negro)]">{index + 1}</TableCell>
                  <TableCell className="font-medium text-[var(--negro)]">{competitor.name}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)]">{competitor.ci}</TableCell>
                  <TableCell>
                    <Badge className="text-sm text-[var(--negro)]" variant="outline">{competitor.area}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--negro)]">{competitor.school}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)]">{competitor.city}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)]">{competitor.year}</TableCell>
                  <TableCell className="font-semibold text-[var(--negro)]">{competitor.score}</TableCell>
                  <TableCell>
                    <Badge className={getMedalColor(competitor.medal)}>{competitor.medal}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}