// src/components/controlFases/PhaseTable.tsx
import React from "react";
import PhaseRow from "./PhaseRow";
import type { FilaFase } from "./types";

export default function PhaseTable({
  title,
  subtitle,
  filas,
  onRefresh,
}: {
  title: string;
  subtitle?: string;
  filas: FilaFase[];
  onRefresh: () => void | Promise<void>;
}) {
  return (
    <div className="rounded-xl border bg-white">
      {/* Header de la tarjeta */}
      <div className="px-5 py-4 border-b">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>

      {/* Tabla (con scroll horizontal en móvil/tablet) */}
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full table-fixed text-sm">
          {/* Anchos estables por columna */}
          <colgroup>
            <col className="w-[200px]" /> {/* Área / Nivel */}
            <col className="w-[160px]" /> {/* Fase Actual */}
            <col className="w-[180px]" /> {/* Progreso */}
            <col className="w-[220px]" /> {/* Clasificación */}
            <col className="w-[200px]" /> {/* Responsable */}
            <col className="w-[160px]" /> {/* Estado */}
            <col className="w-[180px]" /> {/* Acciones */}
          </colgroup>

          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium text-left">Área / Nivel</th>
              <th className="px-5 py-3 font-medium text-left">Fase Actual</th>
              <th className="px-5 py-3 font-medium text-left">Progreso</th>
              <th className="px-5 py-3 font-medium text-left">Clasificación</th>
              <th className="px-5 py-3 font-medium text-left">Responsable</th>
              <th className="px-5 py-3 font-medium text-left">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filas.map((f) => (
              <PhaseRow key={f.id} fila={f} onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
