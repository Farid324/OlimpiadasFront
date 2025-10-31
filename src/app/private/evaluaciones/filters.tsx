interface FiltersProps {
  areas: { id_area: number; nombre_area: string }[];
  niveles: { id_nivel: number; nombre_nivel: string }[];
  selectedArea?: number;
  selectedNivel?: number;
  onChange: (filters: { areaId?: number; nivelId?: number }) => void;
}

export default function Filters({
  areas,
  niveles,
  selectedArea,
  selectedNivel,
  onChange,
}: FiltersProps) {
  const handleAreaChange = (value?: number) => {
    onChange({
      areaId: value,
      nivelId: selectedNivel, // mantiene el nivel actual
    });
  };

  const handleNivelChange = (value?: number) => {
    onChange({
      areaId: selectedArea, // mantiene el área actual
      nivelId: value,
    });
  };
  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <select
          className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-gray-700 text-sm
          focus:outline-none focus:ring-0 focus:border-gray-400 hover:border-gray-400 transition-colors"
          value={selectedArea ?? ''}
          onChange={(e) =>
            handleAreaChange(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Todas las áreas</option>
          {areas?.map((a) => (
            <option key={a.id_area} value={a.id_area}>
              {a.nombre_area}
            </option>
          ))}
        </select>

        <select
          className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-gray-700 text-sm
          focus:outline-none focus:ring-0 focus:border-gray-400 hover:border-gray-400 transition-colors"
          value={selectedNivel ?? ''}
          onChange={(e) =>
            handleNivelChange(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Todos los niveles</option>
          {niveles?.map((n) => (
            <option key={n.id_nivel} value={n.id_nivel}>
              {n.nombre_nivel}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
