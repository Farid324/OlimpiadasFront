// src/components/public-home/ResultsFilters.tsx (CORREGIDO: Muestra el filtro de Año Siempre)

import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Search, Filter, Calendar } from 'lucide-react'; 
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
}: ResultsFiltersProps) {
  return (
    // La grilla md:grid-cols-4 ahora estará llena de filtros, incluso en 'current'
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6"> 
      
      {/* INPUT DE BÚSQUEDA */}
      <div className="relative sm:col-span-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por CI..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10 w-full border-gray-400 placeholder:text-gray-500 text-gray-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        />
      </div>

      {/* SELECT DE ÁREA */}
      <Select value={selectedArea} onValueChange={onSelectedAreaChange}>
        <SelectTrigger 
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

      {/* 🚨 CAMBIO CLAVE: Eliminamos la condición {activeTab === 'historical' && ...} */}
      {/* SELECT DE AÑO (Visible Siempre) */}
      <Select value={selectedYear} onValueChange={onSelectedYearChange}>
        <SelectTrigger 
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
    </div>
  );
}