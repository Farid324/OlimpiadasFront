// src/components/controlFases/PhaseTable.tsx
import React, { useState } from "react";
import type { FilaFase } from "./types";
import ApprovePhaseModal from "./ApprovePhaseModal";
import PhaseRow from "./PhaseRow";

export default function PhaseTable({
  title,
  subtitle,
  filas,
  onRefresh,
}: {
  title: string;
  subtitle?: string;
  filas: FilaFase[];
  onRefresh?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FilaFase | null>(null);

  const abrirModal = (row: FilaFase) => {
    setSelected(row);
    setOpen(true);
  };
  const cerrarModal = () => setOpen(false);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="px-4 py-4 md:px-6 md:py-5 border-b">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>

      {/* Contenedor con scroll horizontal */}
      <div className="overflow-x-auto">
        {/* min-w-* obliga a que la tabla no colapse en móvil y aparezca el scroll */}
        <table className="min-w-[1100px] w-full text-sm text-left">
          <thead className="bg-slate-50/70 text-xs text-slate-600">
            <tr className="[&>th]:px-6 [&>th]:py-3">
              <th className="whitespace-nowrap">Área / Nivel</th>
              <th className="whitespace-nowrap">Fase Actual</th>
              <th className="whitespace-nowrap">Progreso</th>
              <th className="whitespace-nowrap">Clasificación</th>
              <th className="whitespace-nowrap">Responsable</th>
              <th className="whitespace-nowrap">Estado</th>
              <th className="text-right pr-6 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filas.map((f) => (
              <PhaseRow key={f.id} f={f} onApprove={abrirModal} />
            ))}

            {filas.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Un solo modal, fuera del map */}
      <ApprovePhaseModal
        open={open}
        row={selected}
        onClose={cerrarModal}
        onSuccess={() => {
          cerrarModal();
          onRefresh?.();
        }}
      />
    </div>
  );
}
