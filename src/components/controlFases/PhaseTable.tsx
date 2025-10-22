import React from 'react';
import type { FilaFase } from './types';
import { LuCircle } from 'react-icons/lu';

export default function PhaseTable({
  title,
  subtitle,
  filas,
}: {
  title: string;
  subtitle?: string;
  filas: FilaFase[];
}) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="px-4 py-4 md:px-6 md:py-5 border-b">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>

      {/* Contenedor con scroll horizontal */}
      <div className="overflow-x-auto">
        {/* 
          min-w-* obliga a que la tabla no colapse en móvil y aparezca el scroll.
          Ajusta el valor si necesitas más/menos ancho.
        */}
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
              <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Área / Nivel */}
                <td className="px-6 py-4 align-top">
                  <div className="font-medium text-slate-900 whitespace-nowrap">{f.area}</div>
                  <div className="text-xs text-slate-500">{f.nivel}</div>
                </td>

                {/* Fase actual */}
                <td className="px-6 py-4 align-top">
                  <Badge
                    color={
                      f.faseActual === 'Completado'
                        ? 'green'
                        : f.faseActual === 'Evaluación Final'
                        ? 'amber'
                        : 'blue'
                    }
                    label={f.faseActual}
                  />
                </td>

                {/* Progreso */}
                <td className="px-6 py-4 align-top">
                  <div className="w-40">
                    <Progress value={pct(f.progresoHecho, f.progresoTotal)} />
                    <div className="mt-1 text-xs text-slate-600">
                      {f.progresoHecho}/{f.progresoTotal}
                    </div>
                  </div>
                </td>

                {/* Resumen clasificación */}
                <td className="px-6 py-4 align-top">
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-1 text-emerald-600">
                      <LuCircle className="shrink-0" /> Clasificados: {f.resumen.clasificados}
                    </li>
                    <li className="flex items-center gap-1 text-amber-600">
                      <LuCircle className="shrink-0" /> No clasificados: {f.resumen.noClasificados}
                    </li>
                    <li className="flex items-center gap-1 text-red-600">
                      <LuCircle className="shrink-0" /> Descalificados: {f.resumen.descalificados}
                    </li>
                  </ul>
                </td>

                {/* Responsable */}
                <td className="px-6 py-4 align-top">
                  <div className="text-slate-900">{f.responsable}</div>
                  <div className="text-xs text-slate-500 whitespace-nowrap">{f.fechaHora}</div>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 align-top">
                  <Badge
                    color={
                      f.estado === 'Completado'
                        ? 'green'
                        : f.estado === 'Listo para aprobar'
                        ? 'amber'
                        : 'slate'
                    }
                    label={f.estado}
                  />
                </td>

                {/* Acción */}
                <td className="px-6 py-4 align-top text-right">
                  <ActionButton
                    label={f.accionLabel ?? ''}
                    color={f.accionColor ?? 'neutral'}
                    disabled={f.accionDisabled ?? true}
                    onClick={() => {}}
                  />
                </td>
              </tr>
            ))}

            {filas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =============== UI Subcomponents =============== */

function pct(done: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-200">
      <div
        className="h-2 rounded-full bg-blue-600"
        style={{ width: `${value}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      />
    </div>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: 'green' | 'amber' | 'blue' | 'slate';
}) {
  const cls: Record<'green' | 'amber' | 'blue' | 'slate', string> = {
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${cls[color]}`}>
      {label}
    </span>
  );
}

function ActionButton({
  label,
  color,
  disabled,
  onClick,
}: {
  label: string;
  color: 'primary' | 'neutral' | 'success';
  disabled?: boolean;
  onClick: () => void;
}) {
  const style =
    color === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : color === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-600';

  const base =
    'inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors';
  const classes = disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : style;

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${classes}`}>
      {label}
    </button>
  );
}
