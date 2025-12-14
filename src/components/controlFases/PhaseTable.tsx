// src/components/controlFases/PhaseTable.tsx
import React from "react";
import PhaseRow from "./PhaseRow";
import type { FilaFase } from "./types";
import type { PhaseType } from "./phaseApi";

interface PhaseTableProps {
  title: string;
  subtitle?: string;
  filas: FilaFase[];
  onRefresh: () => void | Promise<void>;
  phaseType: PhaseType;
  canApprove: boolean;
}

export default function PhaseTable({
  title,
  subtitle,
  filas,
  onRefresh,
  phaseType,
  canApprove,
}: PhaseTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Encabezado */}
      <div className="px-6 pt-6 pb-3">
        <h2 className="font-semibold text-gray-800 text-base">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Contenedor scroll horizontal */}
      <div className="overflow-x-auto">
        {/* Aumentamos min-w para que haya más espacio para Clasificación */}
        <table className="w-full min-w-[1120px] table-fixed text-[14px]">
          <colgroup>
            {/* Área / Nivel */}
            <col className="w-[120px]" />
            {/* Fase Actual */}
            <col className="w-[140px]" />
            {/* Progreso */}
            <col className="w-[90px]" />
            {/* Clasificación -> MÁS ANCHA */}
            <col className="w-[240px]" />
            {/* Responsable */}
            <col className="w-[160px]" />
            {/* Estado */}
            <col className="w-[140px]" />
            {/* Acciones */}
            <col className="w-[130px]" />
          </colgroup>

          <thead className="border-b border-slate-200 bg-slate-50/40">
            <tr className="text-slate-600">
              <th className="px-4 py-3 text-black font-bold text-left">
                Área / Nivel
              </th>
              <th className="px-4 py-3 text-black font-bold text-left">
                Fase Actual
              </th>
              <th className="px-4 py-3 text-black font-bold text-left">
                Progreso
              </th>
              <th className="px-4 py-3 text-black font-bold text-left">
                Clasificación
              </th>
              <th className="px-4 py-3 text-black font-bold text-left">
                Responsable
              </th>
              <th className="py-3 px-4 text-black tabular-nums text-center">
                Estado
              </th>
              <th className="py-3 px-4 text-black tabular-nums text-center">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filas.map((fila) => (
              <PhaseRow
                key={fila.id}
                fila={fila}
                onRefresh={onRefresh}
                phaseType={phaseType}
                canApprove={canApprove}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
