// src/app/private/olimpistas/page.tsx
"use client";

import { useState } from "react";
import RegisterOlimpistaModal from "@/components/olimpistas/RegisterOlimpistaModal";

export default function OlimpistasPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Olimpistas</h1>
        <p className="text-gray-500 text-sm">
          Administración de Olimpistas por Área de Competencia
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShow(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          + Agregar Olimpista
        </button>
        <button className="px-5 py-2 bg-blue-600/90 text-white rounded-md font-medium opacity-70 cursor-not-allowed">
          + Agregar Grupo Olimpista
        </button>
        <button className="px-5 py-2 bg-blue-600/90 text-white rounded-md font-medium opacity-70 cursor-not-allowed">
          Importar CSV
        </button>
      </div>

      {}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-700 mb-2">
          Olimpistas Registrados
        </h2>
        <p className="text-gray-500 text-sm">
          Lista Completa de los Olimpistas registrados en el sistema
        </p>
        <div className="border rounded-md p-6 text-gray-500 text-center">
          En construcción…
        </div>
      </div>

      {show && (
        <RegisterOlimpistaModal
          onClose={() => setShow(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
