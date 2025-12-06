// src/components/public-home/ResultsFilters.tsx

import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Search, Filter, Calendar, Medal } from 'lucide-react';
import { ActiveTab } from '@/types/principal';

interface ResultsFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedArea: string;
  onSelectedAreaChange: (area: string) => void;
  areas: string[];
  selectedYear: string;
  onSelectedYearChange: (year: string) => void;
  years: number[];
  selectedMedal: string;
  onSelectedMedalChange: (medal: string) => void;
  activeTab: ActiveTab;
}

export function ResultsFilters({
  searchTerm,
  onSearchTermChange,
  selectedArea,
  onSelectedAreaChange,
  areas,
  selectedYear,
  onSelectedYearChange,
  years,
  selectedMedal,
  onSelectedMedalChange,
  activeTab,
}: ResultsFiltersProps) {
  return (
    // CLASE CLAVE: grid-cols-1 en móvil, se expande a grid-cols-2 en sm, 
    // y luego a grid-cols-4 en md (desktop/tablet grande).
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
      {/* INPUT DE BÚSQUEDA: Ocupa 1 columna en móvil (grid-cols-1), 2 en tablet (sm:col-span-2) */}
      <div className="relative sm:col-span-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por CI..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* SELECT DE ÁREA: Ocupa 1 columna en móvil, 1 en desktop */}
      <Select value={selectedArea} onValueChange={onSelectedAreaChange}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Área" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las áreas</SelectItem>
          {areas.map((area) => (
            <SelectItem key={area} value={area}>
              {area}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* SELECT DE AÑO (Solo en Histórico) */}
      {activeTab === 'historical' && (
        <Select value={selectedYear} onValueChange={onSelectedYearChange}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <SelectValue placeholder="Año" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los años</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* SELECT DE MEDALLA: Ocupa 1 columna en móvil. 
        Aseguramos que ocupe la columna de la derecha en desktop cuando 'Año' no está presente. 
      */}
      <Select value={selectedMedal} onValueChange={onSelectedMedalChange}>
        {/* Usamos md:col-start-4 condicionalmente, asegurando que solo se aplique en desktop */}
        <SelectTrigger
          className={activeTab === 'current' ? 'md:col-start-4' : ''}
        >
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4" />
            <SelectValue placeholder="Medalla" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las medallas</SelectItem>
          <SelectItem value="Oro">Oro</SelectItem>
          <SelectItem value="Plata">Plata</SelectItem>
          <SelectItem value="Bronce">Bronce</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}