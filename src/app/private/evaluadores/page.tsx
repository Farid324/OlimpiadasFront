// src/app/private/evaluadores/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/libs/api';
import { Button } from '@/components/ui/Button';
import { LuUsers, LuUserCog, LuLayers, LuAward } from 'react-icons/lu';
import { Mail, Phone, MoreVertical, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react';
import { FiSearch } from 'react-icons/fi';
import AddEvaluatorModal from '@/components/features/RegistroEva/AddEvaluatorModal';
import { usePageHeader } from '@/contexts/pageHeader';

type Area = { id_area: number; nombre_area: string };

type Evaluador = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
  institucion?: string | null;
  especialidad?: string | null;
  experiencia?: number | null;
  activo?: boolean | null;
  evaluadores_area?: { area: Area }[];
  ci?: string | null;
};

export default function EvaluadoresPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { setTitle } = usePageHeader();

  const [editData, setEditData] = useState<Evaluador | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function load(query?: string) {
    setLoading(true);
    try {
      const { data } = await api.get<Evaluador[]>('/evaluadores', {
        params: query ? { q: query } : undefined,
      });
      setEvaluadores(Array.isArray(data) ? data : []);
    } catch {
      setEvaluadores([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const qq = q.trim();
      load(qq ? qq : undefined);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setTitle('Evaluadores');
  }, [setTitle]);

  // cerrar menú al hacer click fuera o con Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpenId(null);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpenId(null);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // Ocultar mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (!deleteSuccess) return;
    const t = setTimeout(() => setDeleteSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [deleteSuccess]);

  const metrics = useMemo(() => {
    const total = evaluadores.length;
    const activos = evaluadores.filter((e) => !!e.activo).length;
    const areasSet = new Set<number>();
    let sumExp = 0;
    for (const e of evaluadores) {
      e.evaluadores_area?.forEach(({ area }) => areasSet.add(area.id_area));
      sumExp += e.experiencia ?? 0;
    }
    return {
      total,
      activos,
      areasCubiertas: areasSet.size,
      promExp: total ? Math.round(sumExp / total) : 0,
    };
  }, [evaluadores]);

  const refetch = () => load(q.trim() || undefined);
  const filtered = q ? evaluadores.filter(filtra(q)) : evaluadores;

  const openCreate = () => {
    setEditData(null);
    setShowModal(true);
  };
  const openEdit = (row: Evaluador) => {
    setEditData(row);
    setShowModal(true);
    setMenuOpenId(null);
  };
  const askDelete = (row: Evaluador) => {
    setConfirmDelete({ id: row.id_usuario, nombre: `${row.nombre} ${row.apellido}` });
    setMenuOpenId(null);
  };
  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/evaluadores/${confirmDelete.id}`);
      setConfirmDelete(null);
      refetch();
      setDeleteSuccess('Evaluador eliminado con éxito');
    } catch {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6" ref={menuRef}>
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Evaluadores</h1>
        <p className="text-gray-500 text-sm">
          Administración de Evaluadores por Área de competencia
        </p>
      </div>

      {/* Mensaje de éxito al eliminar */}
      {deleteSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{deleteSuccess}</span>
        </div>
      )}

      {/* Cards (mismo tamaño que Responsables) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardMetric label="Total Evaluadores" value={metrics.total} icon={<LuUsers />} />
        <CardMetric label="Evaluadores Activos" value={metrics.activos} icon={<LuUserCog />} />
        <CardMetric label="Áreas Cubiertas" value={metrics.areasCubiertas} icon={<LuLayers />} />
        <CardMetric
          label="Promedio Experiencia"
          value={`${metrics.promExp} años`}
          icon={<LuAward />}
        />
      </div>

      {/* Botón */}
      <div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          + Agregar Evaluador
        </Button>
      </div>

      {/* Buscador (estilo tarjeta grande, igual que Responsables) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, correo o institución…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-lg bg-gray-50 border border-gray-200
                       text-gray-800 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                       transition"
            aria-label="Buscar evaluadores"
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

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-700 mb-2">
          Evaluadores Registrados ({filtered.length})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Lista completa de evaluadores por área de competencia
        </p>

        {loading ? (
          <p className="text-gray-500 text-center">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center">
            No hay evaluadores {q ? 'para la búsqueda actual' : 'registrados'}
          </div>
        ) : (
          <div className="max-h-[450px] overflow-y-auto">
            <div
              className="w-full overflow-x-auto md:overflow-x-visible"
              role="region"
              aria-label="Lista de evaluadores con desplazamiento horizontal"
              tabIndex={0}
              ref={menuRef}
            >
              <table className="min-w-[1100px] md:min-w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-white z-10 border-b border-black">
                  <tr className="text-gray-700">
                    <th className="py-3 px-4 text-left font-semibold">Evaluador</th>
                    <th className="py-3 px-4 text-left font-semibold">Contacto</th>
                    <th className="py-3 px-4 text-left font-semibold">Especialización</th>
                    <th className="py-3 px-4 text-left font-semibold">Áreas</th>
                    <th className="py-3 px-4 text-left font-semibold">Institución</th>
                    <th className="py-3 px-4 text-left font-semibold">Experiencia</th>
                    <th className="py-3 px-4 text-center font-semibold">Rol</th>
                    <th className="py-3 px-4 text-center font-semibold">Activo</th>
                    <th className="py-3 px-2 text-right font-semibold" />
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((e) => {
                    const initials =
                      (e.nombre?.[0] || '').concat(e.apellido?.[0] || '').toUpperCase() || 'EV';
                    const isMenuOpen = menuOpenId === e.id_usuario;

                    return (
                      <tr key={e.id_usuario} className="border-b border-gray-200 hover:bg-gray-50">
                        {/* Evaluador */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold">
                              {initials}
                            </div>
                            <span className="font-bold text-black truncate">
                              {e.nombre} {e.apellido}
                            </span>
                          </div>
                        </td>

                        {/* Contacto */}
                        <td className="py-4 px-4 text-gray-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail size={16} className="text-black shrink-0" />
                            <span className="truncate break-all" title={e.correo}>
                              {e.correo}
                            </span>
                          </div>
                          {e.telefono && (
                            <div className="flex items-center gap-2">
                              <Phone size={16} className="text-black" /> {e.telefono}
                            </div>
                          )}
                        </td>

                        {/* Especialización */}
                        <td className="py-4 px-4 text-black">{e.especialidad || '-'}</td>

                        {/* Áreas */}
                        <td className="py-4 px-4">
                          {e.evaluadores_area?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {e.evaluadores_area.map(({ area }) => (
                                <span
                                  key={area.id_area}
                                  className="px-2 py-1 rounded-md bg-gray-200 text-black text-xs font-bold"
                                >
                                  {area.nombre_area}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Institución */}
                        <td className="py-4 px-4 whitespace-normal text-black break-words">
                          {e.institucion || '-'}
                        </td>

                        {/* Experiencia */}
                        <td className="py-4 px-4 text-black">
                          {typeof e.experiencia === 'number' ? `${e.experiencia} años` : '-'}
                        </td>

                        {/* Rol */}
                        <td className="py-4 px-4 text-center">
                          <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                            Evaluador
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4 text-center">
                          {e.activo ? (
                            <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-bold">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs font-bold">
                              Inactivo
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-2 text-right relative">
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setMenuOpenId((id) => (id === e.id_usuario ? null : e.id_usuario));
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 focus:outline-none"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                            aria-label="Acciones de evaluador"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-700" />
                          </button>

                        {isMenuOpen && (
                          <div
                            role="menu"
                            className="absolute right-2 bottom-10 z-20 w-40 rounded-md border-gray-300 bg-white shadow-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => openEdit(e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                            >
                              <Pencil className="w-4 h-4" /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => askDelete(e)}
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
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <AddEvaluatorModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refetch();
          }}
          mode={editData ? 'edit' : 'create'}
          initial={
            editData
              ? {
                  id_usuario: editData.id_usuario,
                  nombre: editData.nombre,
                  apellido: editData.apellido,
                  correo: editData.correo,
                  telefono: editData.telefono ?? '',
                  ci: editData.ci ?? '',
                  institucion: editData.institucion ?? '',
                  especialidad: editData.especialidad ?? '',
                  experiencia: editData.experiencia ?? undefined,
                  id_areas: editData.evaluadores_area
                    ?.map((ea) => ea.area?.id_area)
                    .filter(Boolean) as number[],
                }
              : undefined
          }
        />
      )}

      {/* Confirmación eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">Eliminar evaluador</h3>
              <button
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setConfirmDelete(null)}
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-4 text-sm">
              ¿Seguro que deseas eliminar a{' '}
              <span className="font-semibold">{confirmDelete.nombre}</span>? Esta acción no se puede
              deshacer.
            </div>
            <div className="px-4 py-3 border-t flex justify-end gap-2">
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

/** Filtro auxiliar */
function filtra(q: string) {
  const s = q.toLowerCase();
  return (e: Evaluador) =>
    e.nombre?.toLowerCase().includes(s) ||
    e.apellido?.toLowerCase().includes(s) ||
    e.correo?.toLowerCase().includes(s) ||
    e.institucion?.toLowerCase().includes(s);
}

/* Cards métricas: mismo tamaño que Responsables */
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
    <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="text-black text-2xl [&>*]:w-6 [&>*]:h-6">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-black">{value}</p>
    </div>
  );
}
