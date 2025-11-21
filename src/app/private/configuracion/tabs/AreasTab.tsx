// src/app/private/configuracion/tabs/AreasTab.tsx
'use client';

import { useEffect, useState } from 'react';
// Ruta corregida a tres niveles de carpeta: app/private/configuracion/tabs/ -> src/libs/api
import { api } from '@/libs/api'; 
import { Edit, Trash2, Plus, X, Search, Save, CheckCircle2 } from 'lucide-react';

/* --- Tipos --- */

type AreaDTO = {
  id_area: number;
  nombre_area: string;
  // Aceptamos number o null en el DTO por seguridad, aunque la UI lo maneje como number
  nota_aprobacion: number | null; 
  tipo: 'INDIVIDUAL' | 'GRUPAL';
  niveles_target: string | null; 
  activo: boolean;
};

type AreaResponseItem = {
  id_area: number;
  nombre_area: string;
  nota_aprobacion?: number | null;
  tipo?: 'INDIVIDUAL' | 'GRUPAL' | null;
  niveles_target?: string | null;
  activo?: boolean;
  estado?: string;
  niveles?: unknown[]; 
};

export default function AreasTab() {
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState(''); 

  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaDTO | null>(null);

  // Formulario: Nota inicial se basa en la que se edita o 51
  const [formNombre, setFormNombre] = useState('');
  const [formNota, setFormNota] = useState<number | string>(51);
  const [formTipo, setFormTipo] = useState<'INDIVIDUAL' | 'GRUPAL'>('INDIVIDUAL');
  const [formNiveles, setFormNiveles] = useState<string[]>([]); 

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<AreaResponseItem[]>('/areas'); 
      
      const mapped: AreaDTO[] = Array.isArray(data) 
        ? data.map((d) => ({
            id_area: Number(d.id_area),
            nombre_area: d.nombre_area,
            // Lógica ajustada: 
            // 1. Convertir a number si es string/decimal (típico de DB)
            // 2. Usar 51 como ÚLTIMO recurso si es null o undefined
            nota_aprobacion: d.nota_aprobacion ? Number(d.nota_aprobacion) : 51,
            tipo: d.tipo ?? 'INDIVIDUAL',
            niveles_target: d.niveles_target ?? null, // Usamos null para 'no asignado'
            activo: d.activo ?? true
          })) 
        : [];

      setAreas(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // --- Handlers del Modal ---
  const openModal = (area?: AreaDTO) => {
    if (area) {
      setEditingArea(area);
      setFormNombre(area.nombre_area);
      // Usar la nota existente si existe, si no, 51
      setFormNota(area.nota_aprobacion ?? 51); 
      setFormTipo(area.tipo);
      setFormNiveles(area.niveles_target ? area.niveles_target.split(',').map(s => s.trim()) : []);
    } else {
      setEditingArea(null);
      setFormNombre('');
      setFormNota(51);
      setFormTipo('INDIVIDUAL');
      setFormNiveles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
  };

  const handleLevelChange = (level: string) => {
    setFormNiveles(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleSave = async () => {
    if (!formNombre.trim()) return alert('El nombre es obligatorio');
    
    // Conversión segura: si está vacío (''), lo tratamos como 0 para que falle la validación
    const notaFinal = formNota === '' ? 0 : Number(formNota);

    // Validamos usand la variable convertida
    if (notaFinal < 51 || notaFinal > 100) return alert('La nota debe estar entre 51 y 100');
    if (formNiveles.length === 0) return alert('Seleccione al menos un nivel');

    const payload = {
      nombre_area: formNombre,
      nota_aprobacion: notaFinal, // Usamos notaFinal aquí
      tipo: formTipo,
      niveles_target: formNiveles.join(', '),
    };

    try {
      let updatedAreaResponse: AreaDTO;

      if (editingArea) {
        // En la edición, pasamos solo los campos actualizados
        const { data } = await api.put<AreaResponseItem>(`/areas/${editingArea.id_area}`, payload);
        updatedAreaResponse = {
            ...editingArea, // Mantenemos los campos no editables (como activo)
            nombre_area: data.nombre_area,
            nota_aprobacion: data.nota_aprobacion ? Number(data.nota_aprobacion) : 51,
            tipo: data.tipo ?? 'INDIVIDUAL',
            niveles_target: data.niveles_target ?? null,
            // Aseguramos que el ID y activo estén presentes si la respuesta es parcial
            id_area: editingArea.id_area,
            activo: editingArea.activo,
        };

      } else {
        const { data } = await api.post<AreaResponseItem>('/areas', payload);
        updatedAreaResponse = {
            id_area: Number(data.id_area),
            nombre_area: data.nombre_area,
            nota_aprobacion: data.nota_aprobacion ? Number(data.nota_aprobacion) : 51,
            tipo: data.tipo ?? 'INDIVIDUAL',
            niveles_target: data.niveles_target ?? null,
            activo: data.activo ?? true,
        };
      }
      
      // Actualizamos el estado de la tabla con la respuesta correcta del servidor/mapeo
      setAreas(prev => {
        const index = prev.findIndex(a => a.id_area === updatedAreaResponse.id_area);
        if (index > -1) {
          // Actualizar (edición)
          return prev.map((item, i) => i === index ? updatedAreaResponse : item);
        } else {
          // Agregar (registro nuevo)
          return [...prev, updatedAreaResponse];
        }
      });

      closeModal();
      // Ya actualizamos el estado, no necesitamos un fetchAreas() completo
    } catch (error) {
      console.error('Error guardando área', error);
      alert('Error al guardar el área.');
    }
  };

  const handleDelete = async (id: number) => {
    // Cambiado de window.confirm a una alerta simple ya que no podemos usar window.confirm
    if (!window.confirm('¿Estás seguro de eliminar esta área?')) return; 
    try {
      await api.delete(`/areas/${id}`);
      // Eliminación optimista: asumimos éxito y quitamos de la lista
      setAreas(prev => prev.filter(a => a.id_area !== id));
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el área. Intente de nuevo.');
    }
  };

  const filteredData = areas.filter(a => 
    a.nombre_area.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Toolbar: Buscador + Botón Agregar (Unificados) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
            type="text"
            placeholder="Buscar área..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-500 transition-all"
            />
        </div>

        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Agregar Área
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre de Área</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Niveles</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Nota Aprobación</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 text-sm">Cargando datos...</td></tr>
                ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No se encontraron áreas.</td></tr>
                ) : (
                filteredData.map((area) => (
                    <tr key={area.id_area} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{area.nombre_area}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {area.niveles_target && area.niveles_target !== 'Todos' ? (
                        <div className="flex flex-wrap gap-1.5">
                            {area.niveles_target.split(',').map(l => (
                            <span key={l} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                {l.trim()}
                            </span>
                            ))}
                        </div>
                        ) : <span className="text-gray-400 italic text-xs">No asignado</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${area.tipo === 'GRUPAL' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {area.tipo === 'GRUPAL' ? 'Grupal' : 'Individual'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className="font-mono font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            {area.nota_aprobacion ?? 51}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal(area)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(area.id_area)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform border border-gray-100">
            {/* Modal Header */}
            <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingArea ? 'Editar Área' : 'Registro de Área'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                    {editingArea ? 'Modifique los datos del área' : 'Complete el formulario para registrar'}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Nombre del Área</label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 text-sm transition"
                  placeholder="Ej: Matemáticas"
                />
              </div>

              {/* Nota */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Establecer Nota de Aprobación (51-100)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="51"
                    max="100"
                    // El value lo pasamos tal cual (puede ser número o string vacío)
                    value={formNota} 
                    onChange={(e) => {
                      const val = e.target.value;
                      // Si está vacío, permitimos que se quede vacío
                      if (val === '') {
                          setFormNota('');
                      } else {
                          // Si hay texto, intentamos convertir a entero
                          const parsed = parseInt(val);
                          // Si es un número válido, lo guardamos (esto quita ceros a la izquierda: "07" -> 7)
                          if (!isNaN(parsed)) {
                              setFormNota(parsed);
                          }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Tu validación actual está bien, consérvala
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(e.key)) {
                          e.preventDefault();
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 text-sm transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 bg-white pl-2">Puntos</span>
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Tipo de Participación</label>
                <div className="grid grid-cols-2 gap-3">
                   <button
                     type="button"
                     onClick={() => setFormTipo('INDIVIDUAL')}
                     className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${formTipo === 'INDIVIDUAL' ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                   >
                     <span className={`w-2 h-2 rounded-full ${formTipo === 'INDIVIDUAL' ? 'bg-blue-600' : 'bg-gray-300'}`} /> Individual
                   </button>
                   <button
                     type="button"
                     onClick={() => setFormTipo('GRUPAL')}
                     className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${formTipo === 'GRUPAL' ? 'bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                   >
                     <span className={`w-2 h-2 rounded-full ${formTipo === 'GRUPAL' ? 'bg-purple-600' : 'bg-gray-300'}`} /> Grupal
                   </button>
                </div>
              </div>

              {/* Niveles */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Niveles Habilitados</label>
                <div className="flex gap-3">
                  {['Primaria', 'Secundaria'].map((lvl) => {
                    const isSelected = formNiveles.includes(lvl);
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleLevelChange(lvl)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${isSelected ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-200 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                      >
                         {isSelected ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                         <span className="font-medium text-sm">{lvl}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-gray-50/80 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200/80 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black transition shadow-lg shadow-gray-900/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingArea ? 'Guardar Cambios' : 'Registrar Área'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}