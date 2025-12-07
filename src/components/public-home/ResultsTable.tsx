// Ruta: src/components/public-home/ResultsTable.tsx (FINAL CORREGIDO)

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
// 🚨 CAMBIO: Importamos ActivePhase
import { ActivePhase } from '@/app/page';

interface ResultsTableProps {
  filteredCompetitors: CompetitorData[];
  getMedalColor: (medal: string) => string;
  // 🚨 AÑADIDO: Nuevas props
  activeTab: ActiveTab;
  activePhase: ActivePhase;
}

export function ResultsTable({ 
  filteredCompetitors, 
  getMedalColor, 
  activeTab, 
  activePhase 
}: ResultsTableProps) {
  
  // 🚨 LÓGICA CLAVE: Ocultar Medalla si estamos en la Fase Clasificatoria (fase1)
  const isFaseClasificatoria = activeTab === 'current' && activePhase === 'fase1';

  // Si la medalla está oculta, colSpan es 8 (9 - 1), de lo contrario es 9.
  const colSpanCount = isFaseClasificatoria ? 8 : 9;

  return (
    // CLASE CLAVE: overflow-x-auto permite el scroll horizontal en pantallas pequeñas
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
              
              {/* 🚨 CAMBIO CLAVE: Ocultar el encabezado de Medalla */}
              {!isFaseClasificatoria && (
                <TableHead className="font-semibold whitespace-nowrap">Medalla</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompetitors.length === 0 ? (
              <TableRow>
                {/* 🚨 CAMBIO: ColSpan dinámico */}
                <TableCell colSpan={colSpanCount} className="text-center py-8 text-gray-500">
                  No se encontraron competidores con los filtros seleccionados
                </TableCell>
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
                  
                  {/* 🚨 CAMBIO CLAVE: Ocultar el cuerpo de Medalla */}
                  {!isFaseClasificatoria && (
                    <TableCell>
                      <Badge className={getMedalColor(competitor.medal)}>{competitor.medal}</Badge>
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