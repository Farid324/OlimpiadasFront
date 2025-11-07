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

          const chipClasificacionStyle =
            clasificacion === 'CLASIFICADO'
              ? 'bg-green-100 text-green-700 border-green-300'
              : clasificacion === 'DESCALIFICADO'
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-gray-100 text-gray-600 border-gray-300';

          return (
            <tr
              key={c.competidor.id_competidor}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="p-2 text-center text-black">{i + 1}</td>
              <td className="p-2 text-black font-medium">
                {c.competidor.nombres} {c.competidor.apellidos}
              </td>
              <td className="p-2 text-center text-black">{c.competidor.ci}</td>
              <td className="p-2 text-center text-black">{c.competidor.escuela}</td>

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

              <td className="p-2 flex justify-center gap-2">
                {!nota ? (
                  <Button
                    onClick={() => onEvaluar(c)}
                    size="sm"
                    className="bg-blue-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors"
                  >
                    Evaluar
                  </Button>
                ) : (
                  <Button
                    onClick={() => onEditar(c)}
                    size="sm"
                    variant="outline"
                    className="border-gray-500 text-gray-600 hover:bg-indigo-50 transition-colors rounded-md shadow-sm"
                  >
                    Editar
                  </Button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
