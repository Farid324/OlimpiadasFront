// src/components/public-home/ResultsSection.tsx (CORREGIDO: Tipo de getMedalColor)

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Download, TrendingUp, Calendar, Trophy } from 'lucide-react';

import { ResultsFilters } from './ResultsFilters';
import { ResultsTable } from './ResultsTable';
import { CompetitorData, ActiveTab } from '@/types/principal';
// 🚨 CAMBIO: Importamos ActivePhase desde el archivo page.tsx
import { ActivePhase } from '@/app/page'; 

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
  activeTab: ActiveTab;
  onActiveTabChange: (tab: ActiveTab) => void;
  // 🚨 NUEVOS PROPS
  activePhase: ActivePhase;
  onActivePhaseChange: (phase: ActivePhase) => void;
  onDownloadPDF: () => void;
  // 🚨 CORRECCIÓN CLAVE: El tipo de 'medal' debe aceptar string o null
  getMedalColor: (medal: string | null) => string; 
}

export function ResultsSection(props: ResultsSectionProps) {
  const { activePhase, onActivePhaseChange, activeTab } = props;

  return (
    <section className="py-12 border-[var(--bordeGris)]">
      <Card>
        <CardHeader>
          <CardTitle className="flex text-[var(--negro)] items-start justify-between sm:items-center flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-[var(--azul)]" />
              <span>Lista de Clasificados</span>
            </div>

            <Button
              onClick={props.onDownloadPDF}
              variant="outline"
              className="gap-2 border-[var(--bordeGris)] w-full sm:w-auto"
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
            <TabsList className="grid w-full max-w-sm grid-cols-2">
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
              {/* 🚨 CAMBIO CLAVE: Controlamos el valor de la Fase interna con activePhase y onActivePhaseChange */}
              <Tabs 
                value={activePhase} 
                onValueChange={(v) => onActivePhaseChange(v as ActivePhase)} 
                className="mb-6"
              >
                <TabsList className="grid w-full max-w-sm grid-cols-2">
                  <TabsTrigger value="fase1">Fase Clasificatoria</TabsTrigger>
                  <TabsTrigger value="fase2">Fase Final</TabsTrigger>
                </TabsList>

                {/* === FASE CLASIFICATORIA (fase1) === */}
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
                    activeTab="current"
                  />

                  <div className="mb-4 text-sm text-gray-600">
                    Mostrando {props.filteredCompetitors.length} competidores
                  </div>

                  <ResultsTable
                    filteredCompetitors={props.filteredCompetitors}
                    getMedalColor={props.getMedalColor}
                    // 🚨 AÑADIDO: Pasamos activeTab y activePhase
                    activeTab={activeTab} 
                    activePhase={activePhase} 
                  />
                </TabsContent>

                {/* === FASE FINAL (fase2) === */}
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
                    activeTab="current"
                  />

                  <div className="mb-4 text-sm text-gray-600">
                    Mostrando {props.filteredCompetitors.length} competidores
                  </div>

                  <ResultsTable
                    filteredCompetitors={props.filteredCompetitors}
                    getMedalColor={props.getMedalColor}
                    // 🚨 AÑADIDO: Pasamos activeTab y activePhase
                    activeTab={activeTab} 
                    activePhase={activePhase} 
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
                activeTab="historical"
              />

              <div className="mb-4 text-sm text-gray-600">
                Mostrando {props.filteredCompetitors.length} competidores
              </div>

              <ResultsTable
                filteredCompetitors={props.filteredCompetitors}
                getMedalColor={props.getMedalColor}
                // 🚨 AÑADIDO: Pasamos activeTab y activePhase
                activeTab={activeTab}
                activePhase={activePhase} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}