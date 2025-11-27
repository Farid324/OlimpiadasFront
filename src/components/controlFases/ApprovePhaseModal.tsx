// src/components/controlFases/ApprovePhaseModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ApprovePhaseRow = {
  area: string;
  nivel: string;
  faseActual: string;
};

type ApprovePhaseModalProps = {
  open: boolean;
  row: ApprovePhaseRow;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export default function ApprovePhaseModal({
  open,
  row,
  onClose,
  onConfirm,
  loading = false,
}: ApprovePhaseModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Confirmar aprobación de fase
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Estás a punto de cerrar y aprobar la fase{" "}
            <span className="font-semibold">{row.faseActual}</span> para:
          </p>
          <p className="mt-1 text-sm text-slate-900">
            Área: <span className="font-semibold">{row.area}</span>
            <br />
            Nivel: <span className="font-semibold">{row.nivel}</span>
          </p>
        </div>

        <div className="px-5 py-4 text-sm text-slate-600">
          <p>
            Una vez aprobada la fase, las evaluaciones quedarán bloqueadas y se
            habilitarán los reportes correspondientes.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Aprobando..." : "Aprobar fase"}
          </button>
        </div>
      </div>
    </div>
  );

  // Portal al body para que NO quede dentro del <tbody>
  return createPortal(modalContent, document.body);
}
