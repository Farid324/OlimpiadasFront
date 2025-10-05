// src/components/features/RegistroEva/components/Table.tsx
'use client';

import type { Evaluador } from '../types';

type Props = {
  loading: boolean;
  evaluadores: Evaluador[];
};

export default function Table({ loading, evaluadores }: Props) {
  if (loading) {
    return <p className="text-gray-500 text-center">Cargando evaluadores...</p>;
  }

  if (!evaluadores?.length) {
    return (
      <div className="border rounded-md p-6 text-gray-500 text-center">
        No hay evaluadores registrados
      </div>
    );
  }

  return (
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
            const initials = (e.nombre?.[0] ?? '') + (e.apellido?.[0] ?? '');
            const areas = e.evaluadores_area?.map(a => a.area.nombre_area).join(', ') || '-';

            return (
              <tr key={e.id_usuario} className="border-b hover:bg-gray-50">
                {/* Evaluador */}
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold">
                    {initials.toUpperCase() || 'EV'}
                  </div>
                  <span className="font-bold text-black break-normal">
                    {[e.nombre, e.apellido].filter(Boolean).join(' ') || '—'}
                  </span>
                </td>

                {/* Contacto */}
                <td className="py-3 px-4 text-gray-800">
                  <div className="truncate">{e.correo}</div>
                  {e.telefono && <div>{e.telefono}</div>}
                </td>

                {/* Especialización */}
                <td className="py-3 px-4 text-black">{e.especialidad || '-'}</td>

                {/* Áreas */}
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-md bg-gray-200 text-black text-xs font-bold">
                    {areas}
                  </span>
                </td>

                {/* Institución */}
                <td className="py-3 px-4 whitespace-normal text-black break-words">
                  {e.institucion || '-'}
                </td>

                {/* Experiencia */}
                <td className="py-3 px-4 text-black">
                  {e.experiencia != null ? `${e.experiencia} años` : '-'}
                </td>

                {/* Rol */}
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                    Evaluador
                  </span>
                </td>

                {/* Activo (si en tu API viene el flag) */}
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
  );
}
