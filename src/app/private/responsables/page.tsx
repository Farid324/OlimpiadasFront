'use client';

import { useState, useEffect } from 'react';
import RegisterResponsableModal from '@/components/registroResponsables/RegisterResponsableModal';
import { Mail, Phone } from "lucide-react"; // iconos estilo mockup
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
    <div className="p-6 space-y-6 overflow-hidden">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Responsables</h1>
        <p className="text-gray-500 text-sm">
          Administración de responsable por área de competencia
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow relative h-28">
          <LuUsers className="absolute top-4 right-4 text-black text-3xl" />
          <p className="text-sm text-gray-500">Total Evaluadores</p>
          <p className="text-2xl font-bold text-black mt-2">{responsables.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow relative h-28">
          <LuUserCog className="absolute top-4 right-4 text-black text-3xl" />
          <p className="text-sm text-gray-500">Responsables de Área</p>
          <p className="text-2xl font-bold text-black mt-2">
            {responsables.filter(r => r.activo).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow relative h-28">
          <LuBookOpenCheck className="absolute top-4 right-4 text-black text-3xl" />
          <p className="text-sm text-gray-500">Áreas Cubiertas</p>
          <p className="text-2xl font-bold text-black mt-2">
            {new Set(responsables.map(r => r.area.nombre_area)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow relative h-28">
          <LuAward className="absolute top-4 right-4 text-black text-3xl" />
          <p className="text-sm text-gray-500">Promedio Experiencia</p>
          <p className="text-2xl font-bold text-black mt-2">
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

     

    {/* Modal */}
      {showModal && (
        <RegisterResponsableModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchResponsables(); // recargar después de registrar
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}