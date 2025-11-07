'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FiltersProps {
  areas: { id_area: number; nombre_area: string }[];
  niveles: { id_nivel: number; nombre_nivel: string }[];
  selectedArea?: number;  // 0 = Todas las áreas
  selectedNivel?: number; // 0 = Todos los niveles
  onChange: (filters: { areaId?: number; nivelId?: number }) => void;
}

export default function Filters({
  areas,
  niveles,
  selectedArea,
  selectedNivel,
  onChange,
}: FiltersProps) {
  // mantener placeholder inicial
  const [touchedArea, setTouchedArea] = useState(false);
  const [touchedNivel, setTouchedNivel] = useState(false);
  const areaValue = touchedArea ? (selectedArea ?? '') : '';
  const nivelValue = touchedNivel ? (selectedNivel ?? '') : '';

  const handleAreaChange = (v: string) => {
    setTouchedArea(true);
    onChange({ areaId: v === '' ? undefined : Number(v), nivelId: selectedNivel });
  };
  const handleNivelChange = (v: string) => {
    setTouchedNivel(true);
    onChange({ areaId: selectedArea, nivelId: v === '' ? undefined : Number(v) });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Área */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-700">Área de competencia:</label>
          <div className="relative w-full">
            <div className="relative rounded-md ring-1 ring-black focus-within:ring-1">
              <select
                className={`os-select h-11 w-full appearance-none rounded-md bg-transparent px-3 pr-10 text-sm
                  ${areaValue === '' ? 'text-gray-500' : 'text-black'} focus:outline-none`}
                value={areaValue}
                onFocus={() => setTouchedArea(true)}
                onMouseDown={() => setTouchedArea(true)}
                onChange={(e) => handleAreaChange(e.target.value)}
                aria-label="Filtrar por área"
              >
                <option value="" disabled hidden>Filtrar por área</option>
                <option value={0}>Todas las áreas</option>
                {areas?.map((a) => (
                  <option key={a.id_area} value={a.id_area}>{a.nombre_area}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Nivel */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-700">Nivel de competencia:</label>
          <div className="relative w-full">
            <div className="relative rounded-md ring-1 ring-black focus-within:ring-1">
              <select
                className={`os-select h-11 w-full appearance-none rounded-md bg-transparent px-3 pr-10 text-sm
                  ${nivelValue === '' ? 'text-gray-500' : 'text-black'} focus:outline-none`}
                value={nivelValue}
                onFocus={() => setTouchedNivel(true)}
                onMouseDown={() => setTouchedNivel(true)}
                onChange={(e) => handleNivelChange(e.target.value)}
                aria-label="Filtrar por nivel"
              >
                <option value="" disabled hidden>Filtrar por nivel</option>
                <option value={0}>Todos los niveles</option>
                {niveles?.map((n) => (
                  <option key={n.id_nivel} value={n.id_nivel}>{n.nombre_nivel}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* CSS global para colorear opciones del <select> */}
      <style jsx global>{`
        /* Opciones siempre en negro */
        select.os-select option { color: #111827; }            /* text-gray-900 */
        /* Placeholder (disabled+hidden) en gris */
        select.os-select option[disabled][hidden] { color: #6B7280; } /* text-gray-500 */
      `}</style>
    </div>
  );
}
