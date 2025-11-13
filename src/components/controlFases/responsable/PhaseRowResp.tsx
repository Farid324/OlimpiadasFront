// src/components/controlFases/responsable/PhaseRowResp.tsx
import React, { useState } from "react";
import ProgressBar from "./ProgressBarResp";
import type { FilaFaseResp, FaseActual, EstadoUI, AccionColor } from "./types";
import { aprobarFaseResp } from "./service";
// reutilizamos el modal común
import ApprovePhaseModal from "../ApprovePhaseModal";

function PillFilled({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "blue" | "amber" | "emerald";
}) {
  const map = {
    blue: "bg-blue-100 text-blue-700 ring-blue-200",
    amber: "bg-amber-100 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${map[color]}`}>
      {children}
    </span>
  );
}

function faseColor(f: FaseActual): "blue" | "amber" | "emerald" {
  if (f === "Clasificación") return "blue";
  if (f === "Evaluación Final") return "amber";
  return "emerald";
}

function EstadoChip({ estado }: { estado: EstadoUI }) {
  const text =
    estado === "Completado"
      ? "text-emerald-600"
      : estado === "Listo para aprobar"
      ? "text-amber-600"
      : "text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold ${text}`}>
      {estado}
    </span>
  );
}

const btnMap: Record<AccionColor, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  neutral: "bg-slate-200 hover:bg-slate-300 text-slate-800",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white",
};

export default function PhaseRowResp({
  fila,
  onRefresh,
}: {
  fila: FilaFaseResp;
  onRefresh: () => void | Promise<void>;
}) {
  const {
    area,
    nivel,
    faseActual,
    progresoHecho,
    progresoTotal,
    resumen,
    responsable,
    fechaHora,
    estado,
    accionLabel,
    accionColor = "primary",
    accionDisabled,
  } = fila;

  const porcentaje = progresoTotal > 0 ? Math.round((progresoHecho / progresoTotal) * 100) : 0;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmApprove() {
    try {
      setLoading(true);
      await aprobarFaseResp(fila.id);
      setOpen(false);
      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <tr className="hover:bg-slate-50/60">
        {/* Área / Nivel */}
        <td className="px-4 py-4 align-middle">
          <div className="text-slate-900 font-semibold">{area}</div>
          <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {nivel}
          </span>
        </td>

        {/* Fase Actual */}
        <td className="px-4 py-4 align-middle">
          <PillFilled color={faseColor(faseActual)}>{faseActual}</PillFilled>
        </td>

        {/* Progreso */}
        <td className="px-3 py-4 align-middle text-left">
          <div className="flex flex-col items-start">
            <div className="mb-1 text-xs text-slate-600">
              {progresoHecho}/{progresoTotal}
            </div>
            <div className="w-[84px]">
              <ProgressBar value={porcentaje} widthPx={84} />
            </div>
          </div>
        </td>

        {/* Clasificación */}
        <td className="px-4 py-4 align-middle">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-700">
                Clasificados: <b>{resumen?.clasificados ?? 0}</b>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-slate-700">
                No clasificados: <b>{resumen?.noClasificados ?? 0}</b>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-slate-700">
                Descalificados: <b>{resumen?.descalificados ?? 0}</b>
              </span>
            </div>
          </div>
        </td>

        {/* Responsable */}
        <td className="px-4 py-4 align-middle">
          <div className="text-slate-900 font-semibold">{responsable || "—"}</div>
          {fechaHora && <div className="text-[11px] text-slate-400">{fechaHora}</div>}
        </td>

        {/* Estado */}
        <td className="px-4 py-4 align-middle">
          <EstadoChip estado={estado} />
        </td>

        {/* Acciones */}
        <td className="px-4 py-4 align-middle text-right">
          {accionLabel && (
            <button
              className={`inline-flex items-center rounded-lg px-3.5 py-2 text-xs font-medium shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${btnMap[accionColor]}`}
              disabled={!!accionDisabled}
              onClick={() => setOpen(true)}
            >
              {accionLabel}
            </button>
          )}
        </td>
      </tr>

      {/* Modal de confirmación */}
      <ApprovePhaseModal
        open={open}
        row={fila}
        onClose={() => setOpen(false)}
        onConfirm={confirmApprove}
        loading={loading}
      />
    </>
  );
}
