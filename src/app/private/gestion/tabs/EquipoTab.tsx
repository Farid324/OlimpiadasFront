'use client';

import { UserPlus, ShieldCheck } from 'lucide-react';

export default function EquipoTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Directorio de Personal</h3>
         <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition">
            <UserPlus className="w-4 h-4" />
            Registrar Miembro
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Placeholder Evaluador */}
        <div className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition bg-white flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">JD</div>
            <div>
                <h4 className="font-semibold text-gray-900">Juan Director</h4>
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Responsable de Área
                </p>
                <p className="text-xs text-gray-500">Matemáticas - Secundaria</p>
            </div>
        </div>

        {/* Card Placeholder Evaluador */}
        <div className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition bg-white flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">ME</div>
            <div>
                <h4 className="font-semibold text-gray-900">Maria Evaluadora</h4>
                <p className="text-xs text-green-600 font-medium mb-1">Evaluador</p>
                <p className="text-xs text-gray-500">Física - Primaria</p>
            </div>
        </div>
      </div>
    </div>
  );
}