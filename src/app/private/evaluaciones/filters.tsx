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
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <select
        className="border rounded-lg px-3 py-2 text-sm"
        value={selectedArea ?? ''}
        onChange={(e) =>
          onChange({ areaId: e.target.value ? Number(e.target.value) : undefined })
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
        className="border rounded-lg px-3 py-2 text-sm"
        value={selectedNivel ?? ''}
        onChange={(e) =>
          onChange({ nivelId: e.target.value ? Number(e.target.value) : undefined })
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
  );
}
