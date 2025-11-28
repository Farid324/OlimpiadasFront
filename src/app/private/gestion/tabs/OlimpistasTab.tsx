'use client';

import { Search, Plus, Filter } from 'lucide-react';

export default function OlimpistasTab() {
  return (
    <div className="space-y-6">
      {/* Toolbar Simulado */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, CI o colegio..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filtros
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
                <Plus className="w-4 h-4" />
                Nuevo Olimpista
            </button>
        </div>
      </div>

      <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <p className="text-gray-500">Aquí irá la tabla de Olimpistas...</p>
      </div>
    </div>
  );
}