// src/components/public-home/ResultsFilters.tsx (CORREGIDO)

import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Search, Filter, Calendar } from 'lucide-react'; // 🚨 ELIMINADO: Medal icon
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
  // 🚨 ELIMINADO: selectedMedal: string;
  // 🚨 ELIMINADO: onSelectedMedalChange: (medal: string) => void;
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
  // 🚨 ELIMINADO: selectedMedal,
  // 🚨 ELIMINADO: onSelectedMedalChange,
  activeTab,
}: ResultsFiltersProps) {
  return (
    // Ahora, si Year está oculto, pasamos de 4 a 3 columnas activas en desktop
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6"> 
      
      {/* INPUT DE BÚSQUEDA */}
      <div className="relative sm:col-span-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por CI..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          // 🚨 CAMBIO VISUAL: Borde más oscuro y texto más visible
          className="pl-10 w-full border-gray-400 placeholder:text-gray-500 text-gray-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        />
      </div>

      {/* SELECT DE ÁREA */}
      <Select value={selectedArea} onValueChange={onSelectedAreaChange}>
        <SelectTrigger 
          // 🚨 CAMBIO VISUAL: Borde más oscuro y texto más visible
          className="border-gray-400 text-gray-900 data-[placeholder]:text-gray-900" 
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <SelectValue placeholder="Todas las áreas" />
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
          <SelectTrigger 
            // 🚨 CAMBIO VISUAL: Borde más oscuro y texto más visible
            className="border-gray-400 text-gray-900 data-[placeholder]:text-gray-900"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <SelectValue placeholder="Todos los años" />
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

      {/* 🚨 ELIMINADO: SELECT DE MEDALLA (Estaba aquí) */}
    </div>
  );
}