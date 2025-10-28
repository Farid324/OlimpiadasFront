// Ruta: src/components/public-home/ResultsSection.tsx

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card2'; // Revisa la ruta/nombre
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Download, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { ResultsFilters } from './ResultsFilters'; // Importa el componente de filtros
import { ResultsTable } from './ResultsTable';   // Importa el componente de tabla
import { CompetitorData, ActiveTab } from '@/types/principal'; // Importa los tipos

// Las props son las mismas que antes
interface ResultsSectionProps {
  competitors: CompetitorData[];
  filteredCompetitors: CompetitorData[];
  areas: string[];
  years: number[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedArea: string;
  onSelectedAreaChange: (area: string) => void;
  selectedYear: string;
  onSelectedYearChange: (year: string) => void;
  selectedMedal: string;
  onSelectedMedalChange: (medal: string) => void;
  activeTab: ActiveTab;
  onActiveTabChange: (tab: ActiveTab) => void;
  onDownloadPDF: () => void;
  getMedalColor: (medal: string) => string;
}

export function ResultsSection(props: ResultsSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-[var(--bordeGris)]">
      <Card>
        <CardHeader>
          <CardTitle className="flex text-[var(--negro)] items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-[var(--azul)]" />
              <span>Lista de Clasificados</span>
            </div>
            <Button onClick={props.onDownloadPDF} variant="outline" className="gap-2 border-[var(--bordeGris)]">
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={props.activeTab}
            onValueChange={(v) => props.onActiveTabChange(v as ActiveTab)}
            className="mb-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="current" className="gap-2">
                <Calendar className="h-4 w-4" />
                Clasificando 2024
              </TabsTrigger>
              <TabsTrigger value="historical" className="gap-2">
                <Trophy className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current"></TabsContent>
            <TabsContent value="historical"></TabsContent>
          </Tabs>

          {/* Usa el componente de Filtros */}
          <ResultsFilters
            searchTerm={props.searchTerm}
            onSearchTermChange={props.onSearchTermChange}
            selectedArea={props.selectedArea}
            onSelectedAreaChange={props.onSelectedAreaChange}
            areas={props.areas}
            selectedYear={props.selectedYear}
            onSelectedYearChange={props.onSelectedYearChange}
            years={props.years}
            selectedMedal={props.selectedMedal}
            onSelectedMedalChange={props.onSelectedMedalChange}
            activeTab={props.activeTab}
          />

          <div className="mb-4 text-sm text-gray-600">
            Mostrando {props.filteredCompetitors.length} competidores
          </div>

          {/* Usa el componente de Tabla */}
          <ResultsTable
            filteredCompetitors={props.filteredCompetitors}
            getMedalColor={props.getMedalColor}
          />

        </CardContent>
      </Card>
    </section>
  );
}
