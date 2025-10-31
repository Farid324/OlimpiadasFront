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
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Encabezado del bloque (igual al de Responsables) */}
      <div className="px-6 pt-6 pb-3">
        <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
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

        {/* Cabecera plana con línea inferior */}
          <thead className="border-b border-slate-200 bg-slate-50/40">
            <tr className="text-slate-600">
              <th className="px-4 py-3 text-black font-bold text-left">Área / Nivel</th>
              <th className="px-4 py-3 text-black font-bold text-left">Fase Actual</th>
              <th className="px-4 py-3 text-black font-bold text-left">Progreso</th>
              <th className="px-4 py-3 text-black font-bold text-left">Clasificación</th>
              <th className="px-4 py-3 text-black font-bold text-left">Responsable</th>
              <th className="py-3 px-4 text-black tabular-nums text-center w-24">Estado</th>
              <th className="py-3 px-4 text-black tabular-nums text-center w-24">Acciones</th>
            </tr>
          </thead>

          {/* Filas planas con divisores, sin “cards” */}
          <tbody className="divide-y divide-slate-200">
            {filas.map((f) => (
              <PhaseRow key={f.id} fila={f} onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
