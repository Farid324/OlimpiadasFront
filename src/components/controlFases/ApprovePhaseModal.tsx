// src/components/controlFases/ApprovePhaseModal.tsx
import React from 'react';
import type { FilaFase as AdminRow } from './types';
import type { FilaFaseResp as RespRow } from './responsable/types';

type RowLike = (AdminRow | RespRow) & {
  idArea?: number | string;
  idNivel?: number | string;
};

export default function ApprovePhaseModal({
  open,
  row,
  onConfirm,
  onClose,
  loading = false,
}: {
  open: boolean;
  row: RowLike | null;
  onConfirm: (row: RowLike) => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
}) {
  if (!open || !row) return null;

  const clas = row.resumen?.clasificados ?? 0;
  const noClas = row.resumen?.noClasificados ?? 0;
  const desc = row.resumen?.descalificados ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Aprobar fase
          </h3>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm text-slate-700">
          <div>
            <div className="text-slate-500">Área / Nivel</div>
            <div className="font-semibold">
              {row.area} <span className="text-slate-400">•</span> {row.nivel}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border px-3 py-2">
              <div className="text-[11px] text-slate-500">Clasificados</div>
              <div className="font-semibold text-emerald-600">{clas}</div>
            </div>
            <div className="rounded-lg border px-3 py-2">
              <div className="text-[11px] text-slate-500">No clasificados</div>
              <div className="font-semibold text-amber-600">{noClas}</div>
            </div>
            <div className="rounded-lg border px-3 py-2">
              <div className="text-[11px] text-slate-500">Descalificados</div>
              <div className="font-semibold text-rose-600">{desc}</div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            ¿Confirmas que esta fase está lista para aprobar?
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          <button
            className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={() => onConfirm(row)}
            disabled={loading}
          >
            {loading ? 'Aprobando…' : 'Aprobar fase'}
          </button>
        </div>
      </div>
    </div>
  );
}
