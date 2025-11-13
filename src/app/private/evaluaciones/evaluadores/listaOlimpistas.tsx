'use client';
import { CompetidorInscripcion } from '@/types/notas';
import { Button } from '@/components/ui/Button';

interface Props {
  data: CompetidorInscripcion[];
  onEvaluar: (c: CompetidorInscripcion) => void;
  onEditar: (c: CompetidorInscripcion) => void;
  mostrarNivel?: boolean;
  mostrarEstado?: boolean;
}

export default function CompetidorList({
  data,
  onEvaluar,
  onEditar,
  mostrarNivel,
  mostrarEstado,
}: Props) {
  if (!data.length)
    return <p className="text-gray-400 text-center mt-6">No hay registros.</p>;

  return (
    <table className="w-full mt-2 border-collapse text-sm">
      <thead className="sticky top-0 bg-white z-10 border-b border-gray-300">
        <tr className="text-gray-700">
          <th className="p-2 text-left">#</th>
          <th className="p-2 text-left">Olimpista</th>
          <th className="p-2 text-center">CI</th>
          <th className="p-2 text-center">Colegio</th>
          {mostrarNivel && <th className="p-2 text-center">Nivel</th>}
          <th className="p-2 text-center">Nota</th>
          {mostrarEstado && <th className="p-2 text-center">Clasificación</th>}
          <th className="p-2 text-center">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {data.map((c, i) => {
          const nota = c.evaluaciones?.[0]?.nota ?? null;
          const nivel = c.nivel?.nombre_nivel ?? '—';
          const clasificacion = c.clasificacion ?? '—';
          const firmada = c.evaluaciones?.[0]?.estado_registro === 'FIRMADA';

          const chipClasificacionStyle =
            clasificacion === 'CLASIFICADO'
              ? 'bg-green-100 text-green-700 border-green-300'
              : clasificacion === 'DESCALIFICADO'
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-gray-100 text-gray-600 border-gray-300';

          return (
            <tr
              key={c.competidor.id_competidor}
              className={`border-b border-gray-200 transition-colors group relative ${
                firmada ? 'opacity-60 hover:bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <td className="p-2 text-center text-black">{i + 1}</td>
              <td className="p-2 text-black font-medium">
                {c.competidor.nombres} {c.competidor.apellidos}
              </td>
              <td className="p-2 text-center text-black">{c.competidor.ci}</td>
              <td className="p-2 text-center text-black">
                {c.competidor.escuela}
              </td>

              {mostrarNivel && (
                <td className="p-2 text-center text-black">
                  <span className="inline-block text-xs bg-blue-100 text-blue-700 border border-blue-300 px-2 py-0.5 rounded-md font-bold">
                    {nivel}
                  </span>
                </td>
              )}

              <td className="p-2 text-center text-black font-medium">
                {nota !== null ? nota : '—'}
              </td>

              {mostrarEstado && (
                <td className="p-2 text-center">
                  <span
                    className={`inline-block text-xs border px-2 py-0.5 rounded-md font-bold ${chipClasificacionStyle}`}
                  >
                    {clasificacion}
                  </span>
                </td>
              )}

              <td className="p-2 flex justify-center gap-2 relative">
                {!nota ? (
                  <Button
                    onClick={() => onEvaluar(c)}
                    size="sm"
                    className={`rounded-md shadow-sm transition-colors ${
                      firmada
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-indigo-700 text-white'
                    }`}
                    disabled={firmada}
                  >
                    Evaluar
                  </Button>
                ) : (
                  <Button
                    onClick={() => onEditar(c)}
                    size="sm"
                    variant="outline"
                    className={`rounded-md shadow-sm transition-colors ${
                      firmada
                        ? 'border-gray-400 text-gray-500 cursor-not-allowed bg-gray-100'
                        : 'border-gray-500 text-gray-600 hover:bg-indigo-50'
                    }`}
                    disabled={firmada}
                  >
                    Editar
                  </Button>
                )}

                {/* Tooltip nativo */}
                {firmada && (
                  <div
                    className="absolute bottom-full mb-1 hidden group-hover:block
                               bg-gray-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap
                               left-1/2 -translate-x-1/2"
                  >
                    Fase cerrada
                    <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-gray-800 rotate-45 -translate-x-1/2"></div>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
