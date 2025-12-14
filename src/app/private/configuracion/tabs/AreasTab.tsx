// src/app/private/configuracion/tabs/AreasTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { Edit, Trash2, X, Search, Save, CheckCircle2, AlertCircle, } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';

/* --- Tipos --- */
type AreaDTO = {
  id_area: number;
  nombre_area: string;
  nota_aprobacion: number | null;
  nota_aprobacion_final: number | null;
  tipo: 'INDIVIDUAL' | 'GRUPAL';
  niveles_target: string | null;
  activo: boolean;
};

type AreaResponseItem = {
  id_area: number;
  nombre_area: string;
  nota_aprobacion?: number | null;
  nota_aprobacion_final?: number | null; 
  tipo?: 'INDIVIDUAL' | 'GRUPAL' | null;
  niveles_target?: string | null;
  activo?: boolean;
};

export default function AreasTab() {
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  // Estado del Modal (Crear/Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaDTO | null>(null);

  // --- ESTADOS PARA ELIMINAR ---
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Formulario
  const [formNombre, setFormNombre] = useState('');
  const [formNota, setFormNota] = useState<number | string>(51);
  const [formTipo, setFormTipo] = useState<'INDIVIDUAL' | 'GRUPAL'>(
    'INDIVIDUAL',
  );
  const [formNiveles, setFormNiveles] = useState<string[]>([]);
  const [formNotaFinal, setFormNotaFinal] = useState<number | string>(51);


  // --- ESTADOS DE VALIDACIÓN Y MENSAJES ---
  const [nameError, setNameError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [originalNiveles, setOriginalNiveles] = useState<string[]>([]);


  const fetchAreas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<AreaResponseItem[]>('/areas');

      const mapped: AreaDTO[] = Array.isArray(data)
        ? data.map((d) => ({
          id_area: Number(d.id_area),
          nombre_area: d.nombre_area,
          nota_aprobacion: d.nota_aprobacion
            ? Number(d.nota_aprobacion)
            : 51,
          nota_aprobacion_final: d.nota_aprobacion_final
            ? Number(d.nota_aprobacion_final)
            : 51,
          tipo: d.tipo ?? 'INDIVIDUAL',
          niveles_target: d.niveles_target ?? null,
          activo: d.activo ?? true,
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

  // --- Handlers del Modal (Crear/Editar) ---
  const openModal = (area?: AreaDTO) => {
    setNameError(null);
    setFormStatus(null);

    if (area) {
      setEditingArea(area);
      setFormNombre(area.nombre_area);
      setFormNota(area.nota_aprobacion ?? 51);
      setFormNotaFinal(area.nota_aprobacion_final ?? 51);
      setFormTipo(area.tipo);

      const niveles = area.niveles_target
        ? area.niveles_target.split(',').map((s) => s.trim())
        : [];

      setFormNiveles(niveles);
      setOriginalNiveles(niveles);

    } else {
      setEditingArea(null);
      setFormNombre('');
      setFormNota(51);
      setFormNotaFinal(51);
      setFormTipo('INDIVIDUAL');
      setFormNiveles([]);
      setOriginalNiveles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
    setNameError(null);
    setFormStatus(null);
  };

  const handleLevelChange = (level: string) => {
    if (originalNiveles.includes(level)) {
      return;
    }
    
    setFormNiveles((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level],
    );
  };

  const handleNameChange = (val: string) => {
    setFormNombre(val);
    if (nameError) setNameError(null);
  };

  const handleSave = async () => {
    setFormStatus(null);
    setNameError(null);

    if (!formNombre.trim()) {
      setNameError('El nombre es obligatorio.');
      return;
    }

    const notaFinal = formNota === '' ? 0 : Number(formNota);
    
    // Validación flexible: 0-100
    if (notaFinal < 0 || notaFinal > 100) {
      setFormStatus({
        type: 'error',
        message: 'La nota debe estar entre 0 y 100.',
      });
      return;
    }
    
    const notaFinalFase = formNotaFinal === '' ? 0 : Number(formNotaFinal);

    if (notaFinalFase < 0 || notaFinalFase > 100) {
      setFormStatus({
        type: 'error',
        message: 'La nota de fase final debe estar entre 0 y 100.',
      });
      return;
    }

    
    if (formNiveles.length === 0) {
      setFormStatus({
        type: 'error',
        message: 'Seleccione al menos un nivel.',
      });
      return;
    }

    const nombreNormalizado = formNombre.trim().toLowerCase();
    const duplicado = areas.find(
      (a) =>
        a.nombre_area.trim().toLowerCase() === nombreNormalizado &&
        a.id_area !== editingArea?.id_area,
    );

    if (duplicado) {
      setNameError(
        'Área ya registrada. Edite la existente para modificar niveles.',
      );
      return;
    }

    const payload = {
      nombre_area: formNombre,
      nota_aprobacion: notaFinal,
      nota_aprobacion_final: notaFinalFase,
      tipo: formTipo,
      niveles_target: formNiveles.join(', '),
    };

    try {
      let updatedAreaResponse: AreaDTO;

      if (editingArea) {
        const { data } = await api.put<AreaResponseItem>(
          `/areas/${editingArea.id_area}`,
          payload,
        );
        updatedAreaResponse = {
          ...editingArea,
          nombre_area: data.nombre_area,
          nota_aprobacion: data.nota_aprobacion
            ? Number(data.nota_aprobacion)
            : 51,
          nota_aprobacion_final: data.nota_aprobacion_final
            ? Number(data.nota_aprobacion_final)
            : 51,
          tipo: data.tipo ?? 'INDIVIDUAL',
          niveles_target: data.niveles_target ?? null,
          id_area: editingArea.id_area,
          activo: editingArea.activo,
        };
      } else {
        const { data } = await api.post<AreaResponseItem>('/areas', payload);
        updatedAreaResponse = {
          id_area: Number(data.id_area),
          nombre_area: data.nombre_area,
          nota_aprobacion: data.nota_aprobacion
            ? Number(data.nota_aprobacion)
            : 51,
          nota_aprobacion_final: data.nota_aprobacion_final
            ? Number(data.nota_aprobacion_final)
            : 51,
          tipo: data.tipo ?? 'INDIVIDUAL',
          niveles_target: data.niveles_target ?? null,
          activo: data.activo ?? true,
        };
      }

      setAreas((prev) => {
        const index = prev.findIndex(
          (a) => a.id_area === updatedAreaResponse.id_area,
        );
        if (index > -1) {
          return prev.map((item, i) =>
            i === index ? updatedAreaResponse : item,
          );
        } else {
          return [...prev, updatedAreaResponse];
        }
      });

      setFormStatus({
        type: 'success',
        message: editingArea
          ? 'Área actualizada correctamente.'
          : 'Área registrada correctamente.',
      });

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error: unknown) {
      console.error('Error guardando área', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        const errorMessage = responseData?.message || 'Conflicto desconocido con los datos.';

        if (status === 409) {
          //Manejar el error específico de duplicidad de nombre
          if (
            typeof errorMessage === 'string' &&
            errorMessage.includes('nombre del área ya existe')
          ) {
            setNameError(
              'El nombre del área ya está registrado (incluso si fue eliminado). Se reactivará si corresponde.',
            );
            return;
          }

          setFormStatus({
            type: 'error',
            message: Array.isArray(errorMessage) 
              ? errorMessage.join(', ')
              : String(errorMessage),
            });
          return; // ¡Asegura que el flujo se detiene aquí!
        }
      }

        setFormStatus({
          type: 'error',
          message: 'No se pudo registrar el área. Intente nuevamente.',
        });
      }
    };

  // --- LÓGICA DE ELIMINACIÓN (Modal) ---

  const askDelete = (area: AreaDTO) => {
    setDeleteError(null);
    setConfirmDelete({ id: area.id_area, nombre: area.nombre_area });
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);

    try {
      await api.delete(`/areas/${confirmDelete.id}`);
      setAreas((prev) =>
        prev.filter((a) => a.id_area !== confirmDelete.id),
      );
      setConfirmDelete(null);
    } catch (e: unknown) {
      console.error(e);
      setConfirmDelete(null);

      if (
        axios.isAxiosError(e) &&
        (e.response?.status === 409 || e.response?.status === 500)
      ) {
        setDeleteError(
          `No se puede eliminar el área "${confirmDelete.nombre}" porque tiene olimpistas asignados.`,
        );
      } else {
        setDeleteError(
          'Ocurrió un error al intentar eliminar el área.',
        );
      }

      setTimeout(() => setDeleteError(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const filteredData = areas.filter((a) =>
    a.nombre_area.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="p-0 sm:p-0 space-y-4">
      {/* Banner de Error al Eliminar (Lista Principal) */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Buscador estilo tarjeta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar área..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-lg bg-gray-50 border border-gray-200
              text-gray-800 placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
              transition"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none
                text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      
      {/* Botón agregar área */}
      <div className="flex justify-start">
        <Button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Agregar Área
        </Button>
      </div>

      {/* Tabla dentro de card como Responsables */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <h2 className="font-semibold text-gray-700 mb-2">
          Áreas Registradas ({filteredData.length})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Lista completa de áreas configuradas para las olimpiadas
        </p>

        {loading ? (
          <p className="text-center text-gray-500">Cargando datos...</p>
        ) : filteredData.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center">
            No se encontraron áreas
            {q ? ' para la búsqueda actual.' : ' registradas.'}
          </div>
        ) : (
          <div
            className="max-h-[500px] overflow-y-auto overflow-x-auto"
            tabIndex={0}
          >
            <table className="min-w-[800px] w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10 border-b border-black">
                <tr className="text-gray-700">
                  <th className="py-3 px-4 text-left font-semibold">
                    Nombre de Área
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Niveles
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Tipo
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Nota Aprobación
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Nota Aprobación fase final
                  </th>
                  <th className="py-3 px-4 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((area) => (
                  <tr
                    key={area.id_area}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                      {area.nombre_area}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {area.niveles_target &&
                        area.niveles_target !== 'Todos' ? (
                        <div className="flex flex-wrap gap-1.5">
                          {area.niveles_target.split(',').map((l) => (
                            <span
                              key={l}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200"
                            >
                              {l.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          No asignado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${area.tipo === 'GRUPAL'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}
                      >
                        {area.tipo === 'GRUPAL' ? 'Grupal' : 'Individual'}
                      </span>

                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className="font-bold text-gray-800">
                        {area.nota_aprobacion ?? 51}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className="font-bold text-gray-800">
                        {area.nota_aprobacion_final ?? 51}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(area)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => askDelete(area)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR/EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform border border-gray-100">
            {/* Modal Header */}
            <div className="bg-white px-6 py-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingArea ? 'Editar Área' : 'Registro de Área'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingArea
                    ? 'Modifique los datos del área'
                    : 'Complete el formulario para registrar'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 space-y-5 pb-4">
              {/* Banner Estado */}
              {formStatus && (
                <div
                  className={`px-4 py-3 rounded-lg flex items-center gap-2 text-sm border animate-in fade-in slide-in-from-top-1 ${formStatus.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                  {formStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{formStatus.message}</span>
                </div>
              )}

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Nombre del Área <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none text-gray-900 text-sm transition ${nameError
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/50'
                    : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                  placeholder="Ej: Matemática"
                />
                {nameError && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {nameError}
                  </p>
                )}
              </div>

              {/* Nota */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Establecer Nota de Aprobación (0-100){' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formNota}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') setFormNota('');
                      else {
                        const parsed = parseInt(val);
                        if (!isNaN(parsed)) setFormNota(parsed);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        ![
                          'Backspace',
                          'ArrowLeft',
                          'ArrowRight',
                          'Tab',
                          'Delete',
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 text-sm transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 bg-white pl-2">
                    Puntos
                  </span>
                </div>
              </div>

              {/* Nota Aprobación Fase Final */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nota Aprobación (Fase Final)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formNotaFinal}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') setFormNotaFinal('');
                        else {
                          const parsed = parseInt(val);
                          if (!isNaN(parsed)) setFormNotaFinal(parsed);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 text-sm transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 bg-white pl-2">
                      Puntos
                    </span>
                  </div>
                </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Tipo de Participación{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormTipo('INDIVIDUAL')}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${formTipo === 'INDIVIDUAL'
                      ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${formTipo === 'INDIVIDUAL'
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                        }`}
                    />{' '}
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTipo('GRUPAL')}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${formTipo === 'GRUPAL'
                      ? 'bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${formTipo === 'GRUPAL'
                        ? 'bg-purple-600'
                        : 'bg-gray-300'
                        }`}
                    />{' '}
                    Grupal
                  </button>
                </div>
              </div>

              {/* Niveles */}
              <div className="space-y-1.5 pb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Niveles Habilitados
                </label>
                <div className="flex gap-3">
                  {['Primaria', 'Secundaria'].map((lvl) => {
                    const isSelected = formNiveles.includes(lvl);
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleLevelChange(lvl)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${isSelected
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-200 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="font-medium text-sm">{lvl}</span>
                      </button>
                    );
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

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden transform scale-100 transition-transform">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Eliminar Área
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 transition"
                onClick={() => setConfirmDelete(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                ¿Estás seguro que deseas eliminar el área{' '}
                <span className="font-bold text-gray-900">
                  {confirmDelete.nombre}
                </span>
                ?
                <br />
                <br />
                Esta acción no se puede deshacer si no hay dependencias.
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-2 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white hover:shadow-sm transition-all"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                onClick={doDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sí, eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}