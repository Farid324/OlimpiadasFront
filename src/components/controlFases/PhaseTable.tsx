// src/components/controlFases/PhaseTable.tsx
import React from "react";
import PhaseRow from "./PhaseRow";
import type { FilaFase } from "./types";
import type { PhaseType } from "./phaseApi";

export default function PhaseTable({
  title,
  subtitle,
  filas,
  onRefresh,
  phaseType,
  canApprove,
}: {
  title: string;
  subtitle?: string;
  filas: FilaFase[];
  onRefresh: () => void | Promise<void>;
  phaseType: PhaseType;
  canApprove: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-6 pt-6 pb-3 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] table-fixed text-[14px]">
          <colgroup>
            <col className="w-[100px]" />
            <col className="w-[140px]" />
            <col className="w-[100px]" />
            <col className="w-[140px]" />
            <col className="w-[140px]" />
            <col className="w-[150px]" />
            <col className="w-[120px]" />
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
              <th className="py-3 px-4 text-black tabular-nums text-center w-24">
                Estado
              </th>
              <th className="py-3 px-4 text-black tabular-nums text-center w-24">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
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
