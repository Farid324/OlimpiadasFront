'use client';

import { FiMail, FiPhone } from 'react-icons/fi';

type Area = { nombre_area: string };
type Evaluador = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
  especialidad?: string | null;
  institucion?: string | null;
  experiencia?: number | null;
  evaluadores_area: { area: Area }[];
  activo?: boolean;
  rol?: string;
};

export default function TableEvaluadores({ evaluadores }: { evaluadores: Evaluador[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-semibold text-gray-700 mb-2">
        Evaluadores Registrados ({evaluadores.length})
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Lista completa de evaluadores por área de competencia
      </p>

      {evaluadores.length === 0 ? (
        <div className="border rounded-md p-6 text-gray-500 text-center">
          No hay evaluadores registrados
        </div>
      ) : (
        <div className="max-h-[450px] overflow-y-auto overflow-x-hidden">
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
              {evaluadores.map((e) => {
                const initials = (e.nombre?.[0] || '') + (e.apellido?.[0] || '');
                const areas =
                  e.evaluadores_area?.map((x) => x.area.nombre_area).join(', ') || '-';

                return (
                  <tr key={e.id_usuario} className="border-b hover:bg-gray-50">
                    {/* Evaluador */}
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold">
                        {initials.toUpperCase()}
                      </div>
                      <span className="font-bold text-black">
                        {e.nombre} {e.apellido}
                      </span>
                    </td>

                    {/* Contacto */}
                    <td className="py-3 px-4 text-gray-800">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-black" /> {e.correo}
                      </div>
                      {e.telefono && (
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-black" /> {e.telefono}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-black">{e.especialidad || '-'}</td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-md bg-gray-200 text-black text-xs font-bold">
                        {areas}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-black">{e.institucion || '-'}</td>

                    <td className="py-3 px-4 text-black">
                      {e.experiencia ? `${e.experiencia} años` : '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                        {e.rol || 'Evaluador'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
