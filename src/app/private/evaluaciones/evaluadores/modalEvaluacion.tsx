"use client";
import React, { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";

interface EvaluacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nota: number;
    descripConceptual: string;
    comentario: string;
  }) => void;
  onSaved?: () => void;
  title?: string;
  initialData?: {
    nota?: number;
    descripConceptual?: string;
    etica?: string;
    comentario?: string;
  };
  competidor?: {
    nombres: string;
    apellidos: string;
    ci?: string;
    colegio?: string;
    nivel?: string;
  };
}

// Mensaje descriptivo para la exclusión por ética
const EXCLUSION_MESSAGE =
  "Este competidor quedará fuera de las olimpiadas. El envío de la evaluación registrará una nota de -1.";

export default function ModalEvaluacion({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  competidor,
}: EvaluacionModalProps) {
  const [formData, setFormData] = useState({
    nota: "",
    descripConceptual: "",
    etica: "Sí cumple",
    comentario: "",
  });

  const [errors, setErrors] = useState({
    nota: "",
    descripConceptual: "",
    etica: "",
  });

  const [notaDisabled, setNotaDisabled] = useState(false); // Estado para deshabilitar la nota
  const [exclusionMessage, setExclusionMessage] = useState(""); // Estado para el mensaje descriptivo

  // Lógica para sincronizar estados al abrir o al recibir initialData
  useEffect(() => {
    if (initialData && isOpen) {
      const isNoCumple = initialData.etica === "No cumple" || initialData.nota === -1;
      const initialEtica = isNoCumple ? "No cumple" : (initialData.etica ?? "Sí cumple");
      const initialNota = initialData.nota === -1 ? "" : (initialData.nota?.toString() ?? "");
      
      setFormData({
        nota: initialNota,
        descripConceptual: initialData.descripConceptual ?? "",
        etica: initialEtica,
        comentario: initialData.comentario ?? "",
      });

      // Si es "No cumple" (por nota o por estado), actualiza la UI
      if (isNoCumple) {
        setNotaDisabled(true);
        setExclusionMessage(EXCLUSION_MESSAGE);
      } else {
        setNotaDisabled(false);
        setExclusionMessage("");
      }
    }
    // Limpiar errores al abrir
    setErrors({ nota: "", descripConceptual: "", etica: "" });

  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };
    let disableNote = notaDisabled;
    let message = exclusionMessage;
    let newEtica = formData.etica;

    // --- Lógica de Sincronización Ética/Nota ---

    if (name === "etica") {
      newEtica = value;
      if (value === "No cumple") {
        updated.nota = ""; // Limpia la nota
        message = EXCLUSION_MESSAGE;
        disableNote = true; // Deshabilita el input de nota
      } else {
        message = "";
        disableNote = false; // Habilita el input de nota
      }
    }

    if (name === "nota") {
      const notaNum = Number(value);
      
      // Si la nota se borra y estaba deshabilitada por ética, se re-habilita
      if (value === "" && formData.etica === "Sí cumple") {
        disableNote = false;
        message = "";
      } 
      
      // Si la nota es -1 (aunque lo bloqueamos visualmente en el render)
      if (notaNum === -1) {
        newEtica = "No cumple";
        updated.nota = ""; // Limpia la nota en el input visual
        message = EXCLUSION_MESSAGE;
        disableNote = true; // Deshabilita el input de nota
      } 
      
      // Validación básica para evitar valores fuera del rango esperado (excluyendo el -1 lógico)
      if (notaNum < -1 || notaNum > 100) return;
      
    }
    
    // Si la ética cambia a "No cumple" por un cambio de nota a -1
    updated = { ...updated, etica: newEtica };
    
    // Actualizar estados
    setExclusionMessage(message);
    setNotaDisabled(disableNote);
    setFormData(updated);
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async () => {
    // La nota enviada es -1 si la ética es "No cumple", de lo contrario es el valor ingresado.
    const notaEnviada =
      formData.etica === "No cumple" ? -1 : Number(formData.nota);
    
    const newErrors = { nota: "", descripConceptual: "", etica: "" };

    // Validación de nota solo si no está excluído por ética
    if (formData.etica !== "No cumple") {
      if (!formData.nota.trim() || isNaN(notaEnviada) || notaEnviada < 0 || notaEnviada > 100) {
        newErrors.nota = "La nota es obligatoria y debe estar entre 0 y 100.";
      }
    }

    if (!formData.descripConceptual.trim()) {
      newErrors.descripConceptual =
        "La descripción conceptual es obligatoria.";
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e)) return;

    await onSubmit({
      nota: notaEnviada,
      descripConceptual: formData.descripConceptual,
      comentario: formData.comentario,
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
              {title ||
                `Evaluar a ${competidor?.nombres || ""} ${
                  competidor?.apellidos || ""
                }`}
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
          {/* Ética (Movida arriba para mayor lógica visual) */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Cumplimiento de normas de ética <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="etica"
                value={formData.etica}
                onChange={handleChange}
                className={`os-select appearance-none w-full rounded-lg border ${
                  errors.etica ? "border-red-400" : "border-gray-300"
                } focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm py-2 px-3 pr-10 transition bg-white text-black`}
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
            {/* Mensaje descriptivo para exclusión */}
            {exclusionMessage && (
              <div className="mt-2 p-2 text-sm bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-center">
                <XCircle size={16} className="mr-2 flex-shrink-0" />
                {exclusionMessage}
              </div>
            )}
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Nota obtenida <span className="text-gray-400 text-xs"> (0–100) <span className="text-red-500">*</span></span>
            </label>
            <input
              type="number"
              name="nota"
              value={formData.nota}
              onChange={handleChange}
              // Se deshabilita si la ética es "No cumple"
              disabled={notaDisabled} 
              className={`w-full rounded-lg border ${
                errors.nota ? "border-red-400" : "border-gray-300"
              } focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition text-black ${
                notaDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Ej: 85.5"
              min="0"
              max="100"
            />
            {errors.nota && (
              <p className="text-red-500 text-xs mt-0">{errors.nota}</p>
            )}
          </div>

          {/* Descripción conceptual */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Descripción conceptual del resultado <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripConceptual"
              value={formData.descripConceptual}
              onChange={handleChange}
              className={`w-full rounded-lg border ${
                errors.descripConceptual ? "border-red-400" : "border-gray-300"
              } focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition text-black`}
              rows={2}
              placeholder="Describe el desempeño académico del olimpista..."
            />
            {errors.descripConceptual && (
              <p className="text-red-500 text-xs mt-0">
                {errors.descripConceptual}
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Observaciones
            </label>
            <textarea
              name="comentario"
              value={formData.comentario}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 focus:shadow-sm text-sm placeholder-gray-400 py-2 px-3 transition text-black"
              rows={3}
              placeholder="Comentarios adicionales..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="my-6 border-t border-gray-200"></div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-900 transition"
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