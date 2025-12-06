'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Users } from 'lucide-react';

// Importar componentes de UI (Asegúrate de que estas rutas sean correctas)
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
// import { Button } from '@/components/ui/Button'; 

// IMPORTANTE: Tipos y APIs (Asegúrate de que estas rutas sean correctas)
import type { OlimpistaRow } from '@/types/olimpista'; 
import { fetchOlimpistas, fetchAvailableAreas } from '@/libs/olimpistas.api'; 

// =============================================================
// COMPONENTE TABLA DE OLIMPISTAS ADMINISTRATIVA
// =============================================================

interface OlimpistaTableProps {
  data: OlimpistaRow[];
  loading: boolean;
}

const OlimpistaTable: React.FC<OlimpistaTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <p className="text-gray-500">Cargando directorio de olimpistas...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th> 
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colegio (U.E.)</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No se encontraron olimpistas con los filtros seleccionados.
              </td>
            </tr>
          ) : (
            data.map((o, index) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                
                {/* Propiedades de OlimpistaRow */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{o.nombreCompleto}</td>
                {/* 🚨 COLOR CORREGIDO: De text-blue-600 a text-gray-700 */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{o.area}</td> 
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{o.nivel}</td> 
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{o.unidadEducativa}</td> 
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{o.departamento}</td> 
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// =============================================================
// COMPONENTE PRINCIPAL (OlimpistasTab)
// =============================================================

export default function OlimpistasTab() {
  const [loading, setLoading] = useState(true);
  const [olimpistas, setOlimpistas] = useState<OlimpistaRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Lógica de carga de datos y áreas
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        // q es el parámetro que usa tu API para el término de búsqueda
        q: searchTerm.trim(), 
        // area es el parámetro que usa tu API para el filtro de área
        area: selectedArea === 'all' ? undefined : selectedArea,
      };
      
      const [dataResponse, areasResponse] = await Promise.all([
          fetchOlimpistas(filters), 
          fetchAvailableAreas() 
      ]);
      
      setOlimpistas(dataResponse);
      setAvailableAreas(areasResponse); 

    } catch (error) {
      console.error("Error fetching data:", error);
      setOlimpistas([]);
      setAvailableAreas([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedArea]);

  useEffect(() => {
    // Al cargar el componente o cambiar filtros
    fetchData();
  }, [fetchData]);


  return (
    <div className="space-y-6">
      {/* Toolbar y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
          
          {/* 1. Input de Búsqueda (Nombre, CI, Colegio) */}
          <div className="relative flex-1 min-w-[200px] sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Se mantienen los estilos de borde oscuro y foco
              className="pl-10 pr-4 py-2 border-gray-700 text-gray-900 placeholder-gray-900 focus:border-blue-500 focus:ring-0"
            />
          </div>

          {/* 2. Filtro de Área */}
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <Filter className="h-4 w-4 text-gray-500 hidden sm:block" /> 
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger 
                className="w-40 border-gray-700 text-gray-900 focus:ring-0 focus:border-blue-500"
              >
                <SelectValue placeholder="Todas las áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {availableAreas.map((area) => (
                  // Usar el nombre del área como valor y clave
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Espacio para el botón "Nuevo Olimpista" (ELIMINADO) */}
        <div className="flex gap-2 w-full sm:w-auto">
             {/* Este div queda vacío */}
        </div>
      </div>

      {/* Tabla de Olimpistas */}
      <OlimpistaTable data={olimpistas} loading={loading} />
      
  
    </div>
  );
}