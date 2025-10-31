'use client';
import { Dialog } from '@headlessui/react';
import { CompetidorInscripcionAdmin } from '@/types/notas';

interface ModalViewEvaluationProps {
  isOpen: boolean;
  onClose: () => void;
  competidor: CompetidorInscripcionAdmin | null;
}

export default function ModalViewEvaluation({
  isOpen,
  onClose,
  competidor,
}: ModalViewEvaluationProps) {
  if (!isOpen || !competidor) return null;
  const ev = competidor.evaluaciones?.[0];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="bg-black/50 fixed inset-0" aria-hidden="true" />
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-lg mx-auto shadow-xl">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Detalle de Evaluación
          </Dialog.Title>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Olimpista:</strong> {competidor.competidor.nombres}{' '}
              {competidor.competidor.apellidos}
            </p>
            <p>
              <strong>Área:</strong> {competidor.area?.nombre_area}
            </p>
            <p>
              <strong>Nivel:</strong> {competidor.nivel?.nombre_nivel}
            </p>
            <p>
              <strong>Evaluador:</strong> {ev?.evaluador?.nombre ?? '—'}
            </p>
            <p>
              <strong>Nota:</strong> {ev?.nota ?? 'No evaluado'}
            </p>
            <p>
              <strong>Estado:</strong> {ev?.estado_registro ?? 'PENDIENTE'}
            </p>
            <p>
              <strong>Comentario:</strong> {ev?.comentario ?? '—'}
            </p>
          </div>

          <div className="text-right mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
