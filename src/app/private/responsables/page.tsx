'use client';

import { useState, useEffect } from 'react';
import RegisterResponsableModal from '@/components/registroResponsables/RegisterResponsableModal';
import { Mail, Phone } from "lucide-react"; 
import { LuUsers, LuUserCog, LuBookOpenCheck, LuAward } from 'react-icons/lu';
import { FiSearch } from 'react-icons/fi';
import { api } from '@/libs/api';

interface Responsable {
  id_responsable_area: number;
  usuario: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
    experiencia?: number;
    especialidad?: string;
    institucion: string;
  };
  area: {
    nombre_area: string;
  };
  activo: boolean;
}

export default function ResponsablesPage() {
  const [showModal, setShowModal] = useState(false);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchResponsables = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Responsable[]>('/responsables');
      setResponsables(data);
    } catch (err) {
      console.error('Error cargando responsables', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsables();
  }, []);

  //Filtro
  const filtered = responsables.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.usuario.nombre.toLowerCase().includes(q) ||
      r.usuario.apellido?.toLowerCase().includes(q) ||
      r.usuario.correo.toLowerCase().includes(q) ||
      r.usuario.institucion?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Responsables</h1>
        <p className="text-gray-500 text-sm">
          Administración de responsable por área de competencia
        </p>
      </div>

      {/* Cards métricas (responsivas y con íconos bien posicionados) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Total Evaluadores</p>
            <LuUsers className="text-black text-2xl shrink-0" />
          </div>
          <p className="text-2xl font-bold text-black">{responsables.length}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Responsables de Área</p>
            <LuUserCog className="text-black text-2xl shrink-0" />
          </div>
          <p className="text-2xl font-bold text-black">
            {responsables.filter(r => r.activo).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Áreas Cubiertas</p>
            <LuBookOpenCheck className="text-black text-2xl shrink-0" />
          </div>
          <p className="text-2xl font-bold text-black">
            {new Set(responsables.map(r => r.area.nombre_area)).size}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Promedio Experiencia</p>
            <LuAward className="text-black text-2xl shrink-0" />
          </div>
          <p className="text-2xl font-bold text-black">
            {responsables.length > 0
              ? `${Math.round(
                  responsables.reduce((acc, r) => acc + (r.usuario.experiencia || 0), 0) /
                  responsables.length
                )} años`
              : "0 años"}
          </p>
        </div>
      </div>

      {/* Botón */}
      <div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          + Agregar Responsable
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o institución"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 border rounded-md h-11 text-gray-500"
        />
      </div>

      {/* Tabla con scroll horizontal en pantallas pequeñas */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-700 mb-2">
          Responsables Registrados ({filtered.length})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Lista completa de responsables por área de competencia
        </p>

        {loading ? (
          <p className="text-gray-500 text-center">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center">
            No hay responsables registrados
          </div>
        ) : (
          // Scroll horizontal SOLO para tabla
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="text-gray-700 border-b">
                  <th className="pb-3 px-4 text-left">Evaluador</th>
                  <th className="pb-3 px-4 text-left">Contacto</th>
                  <th className="pb-3 px-4 text-left">Especialización</th>
                  <th className="pb-3 px-4 text-left">Áreas</th>
                  <th className="pb-3 px-4 text-left">Institución</th>
                  <th className="pb-3 px-4 text-left">Experiencia</th>
                  <th className="pb-3 px-4 text-center">Rol</th>
                  <th className="pb-3 px-4 text-center">Activo</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => {
                  const initials = r.usuario.nombre[0] + (r.usuario.apellido?.[0] || "");
                  return (
                    <tr key={r.id_responsable_area} className="border-b hover:bg-gray-50">
                      {/* Evaluador */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold">
                          {initials.toUpperCase()}
                        </div>
                        <span className="font-bold text-black break-normal">
                          {r.usuario.nombre} {r.usuario.apellido}
                        </span>
                      </td>

                      {/* Contacto */}
                      <td className="py-3 px-4 text-gray-800">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-black" />
                          <span className="truncate">{r.usuario.correo}</span>
                        </div>
                        {r.usuario.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-black" /> {r.usuario.telefono}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-black">{r.usuario.especialidad || "-"}</td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-md bg-gray-200 text-black text-xs font-bold">
                          {r.area.nombre_area}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-normal text-black break-words">
                        {r.usuario.institucion || "-"}
                      </td>

                      <td className="py-3 px-4 text-black">
                        {r.usuario.experiencia ? `${r.usuario.experiencia} años` : "-"}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                          Responsable
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RegisterResponsableModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchResponsables();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
