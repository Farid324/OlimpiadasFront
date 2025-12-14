//src/app/private/responsables/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/libs/api';
import { Mail, Phone, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { LuUsers, LuUserCog, LuBookOpenCheck, LuAward } from 'react-icons/lu';
import { FiSearch } from 'react-icons/fi';
import { usePageHeader } from '@/contexts/pageHeader';
import { Button } from '@/components/ui/Button';
import RegisterResponsableModal from '@/components/registroResponsables/RegisterResponsableModal';

interface Responsable {
  id_responsable_area: number;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
    experiencia?: number;
    especialidad?: string;
    institucion: string;
    ci?: string;
  };
  area: {
    id_area: number;
    nombre_area: string;
  };
  activo: boolean;
}

export default function ResponsablesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Responsable | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { setTitle } = usePageHeader();
  const fetchResponsables = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Responsable[]>('/responsables');
      setResponsables(Array.isArray(data) ? data : []);
    } catch {
      setResponsables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsables();
  }, []);
  useEffect(() => {
    setTitle('Responsables');
  }, [setTitle]);

  const filtered = responsables.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.usuario.nombre.toLowerCase().includes(q) ||
      r.usuario.apellido?.toLowerCase().includes(q) ||
      r.usuario.correo.toLowerCase().includes(q) ||
      r.usuario.institucion?.toLowerCase().includes(q)
    );
  });

  const metrics = useMemo(() => {
    const total = responsables.length;
    const activos = responsables.filter((r) => r.activo).length;
    const areasCubiertas = new Set(responsables.map((r) => r.area.nombre_area)).size;
    const promExp =
      total > 0
        ? Math.round(
            responsables.reduce((acc, r) => acc + (r.usuario.experiencia || 0), 0) / total
          )
        : 0;
    return { total, activos, areasCubiertas, promExp };
  }, [responsables]);

  useEffect(() => {
  function handleGlobalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Detecta si el clic fue sobre el botón de los tres puntos o dentro del menú
    const isMenuButton = target.closest('[aria-label="Acciones del responsable"]');
    const isInsideMenu = target.closest('[role="menu"]');
    // Si el clic no fue en el menú ni en el botón, cerramos el menú
    if (!isMenuButton && !isInsideMenu) {
      setMenuOpenId(null);
    }
  }
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') setMenuOpenId(null);
  }
  // Listener global a nivel de documento
  document.addEventListener('click', handleGlobalClick, true);
  document.addEventListener('keydown', handleEscape, true);
  return () => {
    document.removeEventListener('click', handleGlobalClick, true);
    document.removeEventListener('keydown', handleEscape, true);
  };
}, []);

  const openEdit = (r: Responsable) => {
    setEditData(r);
    setShowModal(true);
    setMenuOpenId(null);
  };

  const askDelete = (r: Responsable) => {
    setConfirmDelete({
      id: r.usuario.id_usuario,
      nombre: `${r.usuario.nombre} ${r.usuario.apellido}`,
    });
    setMenuOpenId(null);
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/responsables/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchResponsables();
    } catch {
      setConfirmDelete(null);
    }
  };

  return (
    // ✅ móvil sin padding grande, desktop igual que antes
    <div className="p-0 sm:p-6 space-y-6" ref={menuRef}>
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Responsables</h1>
        <p className="text-gray-500 text-sm">Administración de responsables por área de competencia</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
        <CardMetric label="Total Responsables" value={metrics.total} icon={<LuUsers />} />
        <CardMetric label="Responsables Activos" value={metrics.activos} icon={<LuUserCog />} />
        <CardMetric label="Áreas Cubiertas" value={metrics.areasCubiertas} icon={<LuBookOpenCheck />} />
        <CardMetric label="Promedio Experiencia" value={`${metrics.promExp} años`} icon={<LuAward />} />
      </div>

      {/* Botón */}
      <div className="flex justify-start">
        <Button
          onClick={() => { setEditData(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Agregar Responsable
        </Button>
      </div>


      {/* Buscador (estilo tarjeta grande) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o institución"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-lg bg-gray-50 border border-gray-200
                      text-gray-800 placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                      transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none
                        text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <h2 className="font-semibold text-gray-700 mb-2">
          Responsables Registrados ({filtered.length})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Lista completa de responsables por área de competencia
        </p>

        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center">
            No hay responsables {search ? 'para la búsqueda actual' : 'registrados'}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto overflow-x-auto" tabIndex={0}>
            <table className="min-w-[1100px] border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10 border-b border-black">
                <tr className="text-gray-700">
                  <th className="py-3 px-4 text-left font-semibold">Responsable</th>
                  <th className="py-3 px-4 text-left font-semibold">Contacto</th>
                  <th className="py-3 px-4 text-left font-semibold">Especialización</th>
                  <th className="py-3 px-4 text-left font-semibold">Área</th>
                  <th className="py-3 px-4 text-left font-semibold">Institución</th>
                  <th className="py-3 px-4 text-left font-semibold">Experiencia</th>
                  <th className="py-3 px-4 text-center font-semibold">Rol</th>
                  <th className="py-3 px-4 text-center font-semibold">Activo</th>
                  <th className="py-3 px-2 text-right font-semibold"></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => {
                  const initials =
                    (r.usuario.nombre?.[0] || '').concat(r.usuario.apellido?.[0] || '').toUpperCase();
                  const isMenuOpen = menuOpenId === r.usuario.id_usuario;

                  return (
                    <tr key={r.id_responsable_area} className="border-b border-gray-200 hover:bg-gray-50">
                      {/* Evaluador */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold">
                          {initials.toUpperCase()}
                        </div>
                        <span className="font-bold text-black break-normal">
                          {r.usuario.nombre} {r.usuario.apellido}
                        </span>
                      </td>

                      {/*Contacto */} 
                      <td className="py-4 px-4 text-gray-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail size={16} className="text-black shrink-0" />
                          <span className="truncate break-all" title={r.usuario.correo}>
                            {r.usuario.correo}
                          </span>
                        </div>
                        {r.usuario.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-black" /> {r.usuario.telefono}
                          </div>
                        )}
                      </td>
                      
                      {/*Especialidad */} 
                      <td className="py-4 px-4 text-black">{r.usuario.especialidad || '-'}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 rounded-md bg-gray-200 text-black text-xs font-bold">
                          {r.area.nombre_area}
                        </span>
                      </td>

                      {/*Experiencia*/} 
                      <td className="py-4 px-4 whitespace-normal text-black break-words">
                        {r.usuario.institucion || '-'}
                      </td>
                      <td className="py-4 px-4 text-black">
                        {typeof r.usuario.experiencia === 'number'
                          ? `${r.usuario.experiencia} años`
                          : '-'}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                          Responsable
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {r.activo ? (
                          <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-bold">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs font-bold">
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-2 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId((id) =>
                              id === r.usuario.id_usuario ? null : r.usuario.id_usuario
                            );
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 focus:outline-none"
                          aria-haspopup="menu"
                          aria-expanded={isMenuOpen}
                          aria-label="Acciones del responsable"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Menú contextual hacia arriba */}
                        {isMenuOpen && (
                          <div
                            role="menu"
                            className="absolute right-2 bottom-10 z-20 w-40 rounded-md border-gray-300 bg-white shadow-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                            >
                              <Pencil className="w-4 h-4" /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => askDelete(r)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <RegisterResponsableModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchResponsables();
            setShowModal(false);
          }}
          {...(editData
            ? {
                initial: {
                  id_usuario: editData.usuario.id_usuario,
                  nombre: `${editData.usuario.nombre} ${editData.usuario.apellido}`,
                  correo: editData.usuario.correo,
                  telefono: editData.usuario.telefono || '',
                  ci: editData.usuario.ci || '',
                  institucion: editData.usuario.institucion || '',
                  especialidad: editData.usuario.especialidad || '',
                  experiencia: editData.usuario.experiencia?.toString() || '',
                  id_area: editData.area.id_area.toString(),
                },
                mode: 'edit',
              }
            : { mode: 'create' })}
        />
      )}

      {/* Confirmar eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow w-full max-w-md relative">
            {/* Encabezado */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
              <h3 className="font-semibold text-black">Eliminar Responsable</h3>

              {/* Botón “X” igual al modal de registro */}
              <button
                onClick={() => setConfirmDelete(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo */}
            <div className="px-4 py-4 text-sm text-black">
              ¿Seguro que deseas eliminar a{' '}
              <span className="font-semibold">{confirmDelete.nombre}</span>? Esta acción no se puede deshacer.
            </div>

            {/* Botones */}
            <div className="px-4 py-3 border-t flex justify-end gap-2 border-gray-300">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={doDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="text-black text-2xl">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-black">{value}</p>
    </div>
  );
}
