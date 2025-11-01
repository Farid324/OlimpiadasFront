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
    <Dialog 
    open={isOpen} 
    onClose={onClose}
     className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 " aria-hidden="true" />
          <Dialog.Panel className="relative bg-white rounded-xl p-6 w-full max-w-lg mx-auto shadow-xl z-50">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Ver Evaluación
            </Dialog.Title>
            <p className="text-sm text-gray-500 mb-4">
              {competidor.competidor.nombres} {competidor.competidor.apellidos} - {competidor.area?.nombre_area} ({competidor.nivel?.nombre_nivel})
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Olimpista</label>
                <input disabled value={`${competidor.competidor.nombres} ${competidor.competidor.apellidos}`} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-700" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Evaluador</label>
                <input disabled value={ev?.evaluador?.nombre ?? '—'} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-700" />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-1">Puntuación</label>
                <input disabled value={ev?.nota ?? '—'} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-700" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Puntuación Máxima</label>
                <input disabled value="100" className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-700" />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-600 text-sm mb-1">Observaciones</label>
                <textarea disabled placeholder="Comentarios sobre la evaluación..." className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-700 h-20" value={ev?.comentario ?? ""} />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                Cerrar
              </button>
            </div>
          </Dialog.Panel>
    </Dialog>
  );
}
