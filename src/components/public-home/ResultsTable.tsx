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
import { CompetitorData } from '@/types/principal';

interface ResultsTableProps {
  filteredCompetitors: CompetitorData[];
  getMedalColor: (medal: string) => string;
}

export function ResultsTable({ filteredCompetitors, getMedalColor }: ResultsTableProps) {
  return (
    // CLASE CLAVE: overflow-x-auto permite el scroll horizontal en pantallas pequeñas
    <div className="border-1 border-[var(--bordeGris)] rounded-lg overflow-hidden">
      <div className="overflow-x-auto"> 
        {/* La clase min-w-full dentro de overflow-x-auto asegura que la tabla 
            no se "encogerá" si tiene más contenido del que cabe. */}
        <Table className="min-w-full"> 
          <TableHeader>
            <TableRow className="bg-[var(--blancoGrisOscuro)] font-bold">
              <TableHead className="w-12 font-semibold">#</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Nombre</TableHead> {/* Evita que se rompa */}
              <TableHead className="font-semibold whitespace-nowrap">CI</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Área</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Colegio</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Ciudad</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Año</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Puntaje</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Medalla</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompetitors.length === 0 ? (
              <TableRow>
                {/* Asegúrate de que el colSpan sea correcto (9 columnas) */}
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">No se encontraron competidores con los filtros seleccionados</TableCell>
              </TableRow>
            ) : (
              filteredCompetitors.map((competitor, index) => (
                <TableRow key={competitor.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-[var(--negro)]">{index + 1}</TableCell>
                  <TableCell className="font-medium text-[var(--negro)] whitespace-nowrap">{competitor.name}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">{competitor.ci}</TableCell>
                  <TableCell>
                    <Badge className="text-sm text-[var(--negro)] whitespace-nowrap" variant="outline">{competitor.area}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">{competitor.school}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">{competitor.city}</TableCell>
                  <TableCell className="text-sm text-[var(--negro)] whitespace-nowrap">{competitor.year}</TableCell>
                  <TableCell className="font-semibold text-[var(--negro)] whitespace-nowrap">{competitor.score}</TableCell>
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