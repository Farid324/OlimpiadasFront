import { CompetidorInscripcionAdmin } from '@/types/notas';
import { User, FileText, Award } from 'lucide-react';

interface CompetidorTableProps {
  data: CompetidorInscripcionAdmin[];
  onView: (c: CompetidorInscripcionAdmin) => void;
  nombreArea?: string;
  nombreNivel?: string;
}

export default function CompetidorTable({ data, onView, nombreArea, nombreNivel, }: CompetidorTableProps) {
  const titulo =
    nombreArea && nombreNivel
      ? `Clasificación de ${nombreArea} - ${nombreNivel}`
      : nombreArea
      ? `Clasificación de ${nombreArea}`
      : 'Clasificación general';

  if (!data?.length)
    return (
      <div className="text-center text-gray-500 py-10">
        No se encontraron competidores.
      </div>
    );

  return (
    <div className="overflow-x-auto divide-y divide-gray-100 bg-white shadow-sm p-6 rounded-xl">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-800 mb-1">{titulo}</h1>
        <p className="text-sm text-gray-500">
          Registro y seguimiento de evaluaciones por área y nivel
        </p>
      </div>
        <table className="min-w-full text-sm text-left">
          <thead className="sticky top-0 bg-white z-10 border-b border-gray-300">
            <tr className="text-gray-700">
              <th className="px-4 py-3 text-left font-semibold">Olimpista</th>
              <th className="px-4 py-2">Área</th>
              <th className="px-4 py-2">Nivel</th>
              <th className="px-4 py-2">Evaluador</th>
              <th className="px-4 py-2 text-center">Nota</th>
              <th className="px-4 py-2 text-center">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((c: CompetidorInscripcionAdmin) => {
              const ev = c.evaluaciones?.[0];
              const estado = ev?.estado_registro ?? 'PENDIENTE';

              // colores mejorados, más sutiles y uniformes
              const estadoEstilo = estado === 'FIRMADA'
                ? 'bg-green-50 text-green-700 border border-green-300'
                : estado === 'BORRADOR'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-300';

              return (
                <tr
                  key={c.id_inscripcion}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-900 truncate font-medium">
                    {c.competidor.nombres} {c.competidor.apellidos}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.area?.nombre_area}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.nivel?.nombre_nivel}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ev?.evaluador?.nombre ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-black tabular-nums text-center w-24 font-medium">
                    {ev?.nota ?? '—'}
                  </td>

                  {/* Estado estilizado */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${estadoEstilo}`}
                    >
                      {estado === 'FIRMADA' && (
                        <Award size={14} className="mr-1 text-green-600" />
                      )}
                      {estado === 'BORRADOR' && (
                        <FileText size={14} className="mr-1 text-yellow-600" />
                      )}
                      {estado === 'PENDIENTE' && (
                        <User size={14} className="mr-1 text-gray-500" />
                      )}
                      {estado}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onView(c)}
                      className="px-3 py-1.5 rounded-md bg-gray-300 text-gray-800 text-xs font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  );
}
