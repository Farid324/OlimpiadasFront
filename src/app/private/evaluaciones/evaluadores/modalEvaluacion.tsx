"use client";
import React, { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";

interface EvaluacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nota: number;
    descripcionConceptual: string;
    etica: string;
    observaciones: string;
  }) => void;
  onSaved?: () => void;
  title?: string;
  initialData?: {
    nota?: number;
    descripcionConceptual?: string;
    etica?: string;
    observaciones?: string;
  };
  competidor?: {
    nombres: string;
    apellidos: string;
  };
}

export default function ModalEvaluacion({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  competidor,
}: EvaluacionModalProps) {
  const [formData, setFormData] = useState({
    nota: initialData?.nota?.toString() ?? "",
    descripcionConceptual: initialData?.descripcionConceptual ?? "",
    etica: initialData?.etica ?? "Sí cumple",
    observaciones: initialData?.observaciones ?? "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nota: initialData.nota?.toString() ?? "",
        descripcionConceptual: initialData.descripcionConceptual ?? "",
        etica: initialData.etica ?? "Sí cumple",
        observaciones: initialData.observaciones ?? "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
  await onSubmit({
    nota: Number(formData.nota),
    descripcionConceptual: formData.descripcionConceptual,
    etica: formData.etica,
    observaciones: formData.observaciones,
  });
  onClose();
};

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transition-all animate-scaleIn"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {title || `Evaluar a ${competidor?.nombres || ""} ${competidor?.apellidos || ""}`}
            </h2>
            <p className="text-sm text-gray-500">
              Registra la nota y observaciones de la evaluación
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Nota obtenida <span className="text-gray-400 text-xs">(0–100)</span>
            </label>
            <input
              type="number"
              name="nota"
              value={formData.nota}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition"
              placeholder="Ej: 85.5"
            />
          </div>

          {/* Descripción conceptual */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Descripción conceptual del resultado *
            </label>
            <textarea
              name="descripcionConceptual"
              value={formData.descripcionConceptual}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition"
              rows={2}
              placeholder="Describe el desempeño académico del olimpista..."
            />
          </div>

          {/* Ética */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Cumplimiento de normas de ética *
            </label>
            <div className="relative">
              <select
                name="etica"
                value={formData.etica}
                onChange={handleChange}
                className="appearance-none w-full rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm py-2 px-3 pr-10 transition bg-white"
              >
                <option value="Sí cumple">Sí cumple</option>
                <option value="No cumple">No cumple</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                {formData.etica === "Sí cumple" ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : (
                  <XCircle size={18} className="text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition"
              rows={3}
              placeholder="Comentarios adicionales..."
            />
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-[#6E42FF] text-white hover:bg-[#5b37d8] transition"
          >
            Guardar Evaluación
          </button>
        </div>
      </div>
    </div>
  );
}
