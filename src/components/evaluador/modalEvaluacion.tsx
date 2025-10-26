// src/components/evaluador/modalEvaluacion.tsx
"use client";
import React, { useState, useEffect } from "react";

interface EvaluacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nota: number;
    descripcionConceptual: string;
    etica: string;
    observaciones: string;
  }) => void;
  title?: string;
  initialData?: {
    nota?: number;
    descripcionConceptual?: string;
    etica?: string;
    observaciones?: string;
  };
}

export default function ModalEvaluacion({
  isOpen,
  onClose,
  onSubmit,
  title = "Registrar Evaluación",
  initialData,
}: EvaluacionModalProps) {
  const [formData, setFormData] = useState({
    nota: initialData?.nota?.toString() ?? "",
    descripcionConceptual: initialData?.descripcionConceptual ?? "",
    etica: initialData?.etica ?? "",
    observaciones: initialData?.observaciones ?? "",
  });

  // Actualiza datos si cambian
  useEffect(() => {
    if (initialData) {
      setFormData({
        nota: initialData.nota?.toString() ?? "",
        descripcionConceptual: initialData.descripcionConceptual ?? "",
        etica: initialData.etica ?? "",
        observaciones: initialData.observaciones ?? "",
      });
    }
  }, [initialData]);

  // Cierra el modal con tecla Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const dataToSubmit = {
      nota: Number(formData.nota),
      descripcionConceptual: formData.descripcionConceptual,
      etica: formData.etica,
      observaciones: formData.observaciones,
    };
    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Nota</label>
          <input
            type="number"
            name="nota"
            value={formData.nota}
            onChange={handleChange}
            className="w-full mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej. 85"
          />

          <label className="block text-sm font-medium text-gray-700">
            Descripción conceptual
          </label>
          <input
            type="text"
            name="descripcionConceptual"
            value={formData.descripcionConceptual}
            onChange={handleChange}
            className="w-full mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej. Muy bueno"
          />

          <label className="block text-sm font-medium text-gray-700">Ética</label>
          <input
            type="text"
            name="etica"
            value={formData.etica}
            onChange={handleChange}
            className="w-full mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej. Excelente conducta"
          />

          <label className="block text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="w-full mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Escribe observaciones..."
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 space-x-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Guardar evaluación
          </button>
        </div>
      </div>
    </div>
  );
}
