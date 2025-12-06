import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Download, TrendingUp, Calendar, Trophy } from 'lucide-react';

import { ResultsFilters } from './ResultsFilters';
import { ResultsTable } from './ResultsTable';

import { CompetitorData, ActiveTab } from '@/types/principal';

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

            <Button
              onClick={props.onDownloadPDF}
              variant="outline"
              className="gap-2 border-[var(--bordeGris)]"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* ==== TABS PRINCIPALES ==== */}
          <Tabs
            value={props.activeTab}
            onValueChange={(v) => props.onActiveTabChange(v as ActiveTab)}
            className="mb-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="current" className="gap-2">
                <Calendar className="h-4 w-4" />
                Clasificando 2025
              </TabsTrigger>

              <TabsTrigger value="historical" className="gap-2">
                <Trophy className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            {/* ----------------------------------- */}
            {/* TAB: CLASIFICANDO (CON FASES INTERNAS) */}
            {/* ----------------------------------- */}
            <TabsContent value="current" className="mt-6">
              <Tabs defaultValue="fase1" className="mb-6">
                <TabsList className="grid w-full max-w-sm grid-cols-2">
                  <TabsTrigger value="fase1">Fase Clasificatoria</TabsTrigger>
                  <TabsTrigger value="fase2">Fase Final</TabsTrigger>
                </TabsList>

                {/* === FASE CLASIFICATORIA === */}
                <TabsContent value="fase1">
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
                    activeTab="current"
                  />

                  <div className="mb-4 text-sm text-gray-600">
                    Mostrando {props.filteredCompetitors.length} competidores
                  </div>

                  <ResultsTable
                    filteredCompetitors={props.filteredCompetitors}
                    getMedalColor={props.getMedalColor}
                  />
                </TabsContent>

                {/* === FASE FINAL === */}
                <TabsContent value="fase2">
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
                    activeTab="current"
                  />

                  <div className="mb-4 text-sm text-gray-600">
                    Mostrando {props.filteredCompetitors.length} competidores
                  </div>

                  <ResultsTable
                    filteredCompetitors={props.filteredCompetitors}
                    getMedalColor={props.getMedalColor}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* ---------------------------- */}
            {/* TAB: HISTÓRICO */}
            {/* ---------------------------- */}
            <TabsContent value="historical" className="mt-6">
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
                activeTab="historical"
              />

              <div className="mb-4 text-sm text-gray-600">
                Mostrando {props.filteredCompetitors.length} competidores
              </div>

              <ResultsTable
                filteredCompetitors={props.filteredCompetitors}
                getMedalColor={props.getMedalColor}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
