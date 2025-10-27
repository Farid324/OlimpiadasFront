// src/components/controlFases/ApprovePhaseModal.tsx
"use client";

import { useMemo, useState } from "react";
import ModalPortal from "@/components/ui/ModalPortal";
import type { FilaFase } from "./types";
import { closePhase } from "./phaseApi";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { RiErrorWarningLine } from "react-icons/ri";
import { FiCheckCircle } from "react-icons/fi";

// Interfaz para errores controlados
interface AppError {
  message?: string;
}

export default function ApprovePhaseModal({
  open,
  row,
  onClose,
  onSuccess,
}: {
  open: boolean;
  row: FilaFase | null;
  onClose: () => void;
  onSuccess: () => void; // refresca la tabla tras aprobar
}) {
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resumen mostrado en el modal
  const resumen = useMemo(() => {
    if (!row) return { c: 0, n: 0, d: 0 };
    return {
      c: row.resumen.clasificados,
      n: row.resumen.noClasificados,
      d: row.resumen.descalificados,
    };
  }, [row]);

  if (!open || !row) return null;

  // Inferencia de IDs por fallback
  const idArea = row.idArea ?? Number(row.id.split("-")[0]);
  const idNivel = row.idNivel ?? Number(row.id.split("-")[1]);

  const enviar = async (): Promise<void> => {
    setError(null);
    setSubmitting(true);
    try {
      await closePhase(idArea, idNivel, { type: "CLASIFICACION", comentario });
      onClose();
      onSuccess();
    } catch (e: unknown) {
      const err = e as AppError;
      setError(err?.message || "Ocurrió un error al cerrar la fase.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed z-[101] inset-0 flex items-center justify-center px-3"
      >
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-black">
                Aprobar Fase de Evaluación
              </h2>
              <p className="text-sm text-gray-500">
                {row.area} - {row.nivel}
              </p>
            </div>
            <button
              type="button"
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {error && <ErrorMessage message={error} />}

            {/* Resumen */}
            <section className="rounded-lg border bg-gray-50 p-4">
              <h3 className="font-medium text-gray-800 mb-2">
                Resumen de Resultados
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-emerald-600 text-xl font-bold">
                    {resumen.c}
                  </div>
                  <div className="text-xs text-gray-600">Clasificados</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-600 text-xl font-bold">
                    {resumen.n}
                  </div>
                  <div className="text-xs text-gray-600">No clasificados</div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 text-xl font-bold">
                    {resumen.d}
                  </div>
                  <div className="text-xs text-gray-600">Descalificados</div>
                </div>
              </div>
            </section>

            {/* Comentario */}
            <section>
              <label className="block text-sm font-medium text-black mb-1">
                Comentarios de Aprobación
              </label>
              <textarea
                className="w-full min-h-24 rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Comentarios sobre la aprobación de esta fase..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </section>

            {/* Aviso */}
            <section className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm shadow-sm">
              <RiErrorWarningLine className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
              <div>
                <strong className="block mb-1">Importante:</strong>
                Al aprobar esta fase, se habilitarán las funciones de generación
                de reportes y certificados correspondientes. También se
                bloquearán cambios de notas.
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t">
            <button
              type="button"
              className="rounded-md border bg-white px-4 py-2 text-sm text-black hover:bg-gray-200"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={enviar}
              disabled={submitting}
            >
              {submitting ? (
                "Aprobando…"
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4 text-white" />
                  Aprobar Fase
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
