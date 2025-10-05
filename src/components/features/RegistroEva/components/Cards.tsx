// src/components/features/RegistroEva/components/Cards.tsx
'use client';

import { LuUsers, LuUserCog, LuLayers, LuAward } from 'react-icons/lu';

type Props = {
  total: number;
  activos: number;          // ← renombrado
  areasCubiertas: number;
  promExp: number;
  onAdd: () => void;
};


function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative bg-white p-4 rounded-lg shadow h-28">
      {/* Ícono alineado */}
      <div className="absolute top-3 right-3 text-gray-800 text-2xl">
        {icon}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-black mt-2">{value}</p>
    </div>
  );
}

export default function Cards({
  total,
  activos,
  areasCubiertas,
  promExp,
  onAdd,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Grid de 4 tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Evaluadores" value={total} icon={<LuUsers />} />
        <MetricCard label="Evaluadores Activos" value={activos} icon={<LuUserCog />} />   {/* ← nuevo label */}
        <MetricCard label="Áreas Cubiertas" value={areasCubiertas} icon={<LuLayers />} />
        <MetricCard label="Promedio Experiencia" value={`${Math.round(promExp)} años`} icon={<LuAward />} />


      </div>

      {/* Botón agregar */}
      <div>
        <button
          onClick={onAdd}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          + Agregar Evaluador
        </button>
      </div>
    </div>
  );
}
