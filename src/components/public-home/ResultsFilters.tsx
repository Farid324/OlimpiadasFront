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
import { ActiveTab } from '@/types/principal'; // Importa el tipo

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por CI..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10"
        />
      </div>

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

      <Select value={selectedMedal} onValueChange={onSelectedMedalChange}>
        <SelectTrigger
          className={activeTab === 'current' ? '' : 'md:col-start-4'}
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
