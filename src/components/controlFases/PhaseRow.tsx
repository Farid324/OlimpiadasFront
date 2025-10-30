// src/components/controlFases/PhaseRow.tsx
import React from "react";
import ProgressBar from "./ProgressBar";
import type { FilaFase, AccionColor, EstadoFila, FaseActual } from "./types";

function Pill({
  children,
  color = "slate",
}: {
  children: React.ReactNode;
  color?: "green" | "red" | "yellow" | "slate";
}) {
  const map: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    red: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    yellow: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${map[color]}`}>
      {children}
    </span>
  );
}

function colorPorEstado(estado: EstadoFila): "green" | "yellow" | "slate" {
  switch (estado) {
    case "Completado":
      return "green";
    case "Listo para aprobar":
      return "yellow";
    default:
      return "slate";
  }
}

function colorPorFase(fase: FaseActual): "yellow" | "slate" | "green" {
  if (fase === "Evaluación Final") return "yellow";
  if (fase === "Completado") return "green";
  return "slate";
}

function clasesBoton(color: AccionColor): string {
  const base =
    "inline-flex items-center rounded-lg px-3.5 py-2 text-xs font-medium shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const map: Record<AccionColor, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    neutral: "bg-slate-200 text-slate-800 hover:bg-slate-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  };
  return `${base} ${map[color]}`;
}

export default function PhaseRow({
  fila,
  onRefresh,
}: {
  fila: FilaFase;
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

  const porcentaje =
    progresoTotal > 0 ? Math.max(0, Math.min(100, Math.round((progresoHecho / progresoTotal) * 100))) : 0;

  return (
    <tr className="hover:bg-slate-50/60">
      {/* Área / Nivel */}
      <td className="px-5 py-4 align-middle">
        <div className="text-slate-900 font-medium">{area}</div>
        <div className="text-slate-500 text-xs mt-0.5">{nivel}</div>
      </td>

      {/* Fase actual */}
      <td className="px-5 py-4 align-middle">
        <Pill color={colorPorFase(faseActual)}>{faseActual}</Pill>
      </td>

      {/* Progreso */}
      <td className="px-5 py-4 align-middle">
        <div className="text-slate-700 text-xs mb-1">
          {progresoHecho}/{progresoTotal}
        </div>
        <ProgressBar value={porcentaje} />
      </td>

      {/* Clasificación */}
      <td className="px-5 py-4 align-middle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 text-xs">
              Clasificados: <b>{resumen?.clasificados ?? 0}</b>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 text-xs">
              No clasificados: <b>{resumen?.noClasificados ?? 0}</b>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span className="text-slate-700 text-xs">
              Descalificados: <b>{resumen?.descalificados ?? 0}</b>
            </span>
          </div>
        </div>
      </td>

      {/* Responsable */}
      <td className="px-5 py-4 align-middle">
        <div className="text-slate-700 text-xs whitespace-nowrap">
          {responsable || "—"}
        </div>
        {fechaHora && <div className="text-slate-400 text-[11px]">{fechaHora}</div>}
      </td>

      {/* Estado */}
      <td className="px-5 py-4 align-middle">
        <Pill color={colorPorEstado(estado)}>{estado}</Pill>
      </td>

      {/* Acciones */}
      <td className="px-5 py-4 align-middle text-right">
        {accionLabel && (
          <button
            className={clasesBoton(accionColor)}
            disabled={accionDisabled}
            onClick={() => onRefresh()}
          >
            {accionLabel}
          </button>
        )}
      </td>
    </tr>
  );
}
