import React from "react";
import PhaseRowResp from "./PhaseRowResp";
import type { FilaFaseResp } from "./types";

export default function PhaseTableResp({
  title,
  subtitle,
  filas,
  onRefresh,
}: {
  title: string;
  subtitle?: string;
  filas: FilaFaseResp[];
  onRefresh: () => void | Promise<void>;
}) {
  const COLS = [
    "w-[100px]", // Área / Nivel
    "w-[140px]", // Fase Actual
    "w-[100px]", // Progreso
    "w-[140px]", // Clasificación
    "w-[140px]", // Responsable
    "w-[120px]", // Estado
    "w-[120px]", // Acciones
  ];

  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] table-fixed text-sm">
          {/* Sin espacios dentro del colgroup */}
          <colgroup>{COLS.map((c, i) => (<col key={i} className={c} />))}</colgroup>

          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium text-left">Área / Nivel</th>
              <th className="px-4 py-3 font-medium text-left">Fase Actual</th>
              <th className="px-4 py-3 font-medium text-left">Progreso</th>
              <th className="px-4 py-3 font-medium text-left">Clasificación</th>
              <th className="px-4 py-3 font-medium text-left">Responsable</th>
              <th className="px-4 py-3 font-medium text-left">Estado</th>
              <th className="py-3 pr-4 pl-0 font-medium !text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filas.map((f) => (
              <PhaseRowResp key={f.id} fila={f} onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
