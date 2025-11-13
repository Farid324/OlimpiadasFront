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
    ci?: string;
    colegio?: string;
    nivel?: string;
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

  const [errors, setErrors] = useState({
    nota: "",
    descripcionConceptual: "",
    etica: "",
  });

  const [eticaDisabled, setEticaDisabled] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        nota: initialData.nota?.toString() ?? "",
        descripcionConceptual: initialData.descripcionConceptual ?? "",
        etica: initialData.etica ?? "Sí cumple",
        observaciones: initialData.observaciones ?? "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    // Sincroniza automáticamente ética con nota
    if (name === "nota") {
      const notaNum = Number(value);
      if (notaNum === -1) {
        updated.etica = "No cumple";
        setEticaDisabled(true);
      } else {
        setEticaDisabled(false);
        if (formData.etica === "No cumple") {
          updated.etica = "Sí cumple";
        }
      }
    }

    setFormData(updated);
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async () => {
    const newErrors = { nota: "", descripcionConceptual: "", etica: "" };
    const notaNum = Number(formData.nota);

    if (!formData.nota.trim()) {
      newErrors.nota = "La nota es obligatoria.";
    } else if (isNaN(notaNum) || notaNum < -1 || notaNum > 100) {
      newErrors.nota = "Debe ser un número entre -1 y 100.";
    }

    if (!formData.descripcionConceptual.trim()) {
      newErrors.descripcionConceptual = "La descripción conceptual es obligatoria.";
    }

    if (!["Sí cumple", "No cumple"].includes(formData.etica)) {
      newErrors.etica = "Debe seleccionar una opción válida.";
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e)) return;

    await onSubmit({
      nota: notaNum,
      descripcionConceptual: formData.descripcionConceptual,
      etica: formData.etica,
      observaciones: formData.observaciones,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadeIn"
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
              Nota obtenida <span className="text-gray-400 text-xs">(-1–100)</span>
            </label>
            <input
              type="number"
              name="nota"
              value={formData.nota}
              onChange={handleChange}
              className={`w-full rounded-lg border ${
                errors.nota ? "border-red-400" : "border-gray-300"
              } focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition text-black`}
              placeholder="Ej: 85.5 o -1 si fue descalificado"
            />
            {errors.nota && (
              <p className="text-red-500 text-xs mt-0">{errors.nota}</p>
            )}
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
              className={`w-full rounded-lg border ${
                errors.descripcionConceptual ? "border-red-400" : "border-gray-300"
              } focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition text-black`}
              rows={2}
              placeholder="Describe el desempeño académico del olimpista..."
            />
            {errors.descripcionConceptual && (
              <p className="text-red-500 text-xs mt-0">
                {errors.descripcionConceptual}
              </p>
            )}
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
                disabled={eticaDisabled}
                className={`os-select appearance-none w-full rounded-lg border ${
                  errors.etica ? "border-red-400" : "border-gray-300"
                } focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm py-2 px-3 pr-10 transition bg-white ${
                  eticaDisabled ? "bg-gray-100 cursor-not-allowed" : ""
                } text-black`}
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
            {errors.etica && (
              <p className="text-red-500 text-xs mt-0">{errors.etica}</p>
            )}
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
              className="w-full rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition text-black"
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
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-indigo-700 transition"
          >
            Guardar Evaluación
          </button>
        </div>

        {/* Fuerza el color negro de las <option> del select */}
        <style jsx global>{`
          select.os-select option { color: #111827; }
        `}</style>
      </div>
    </div>
  );
}
