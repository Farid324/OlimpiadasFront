'use client';
import { CompetidorInscripcion } from '@/types/notas';
import { Button } from '@/components/ui/Button';

interface Props {
  data: CompetidorInscripcion[];
  onEvaluar: (c: CompetidorInscripcion) => void;
  onEditar: (c: CompetidorInscripcion) => void;
}

export default function CompetidorList({ data, onEvaluar, onEditar }: Props) {
  if (!data.length)
    return <p className="text-gray-400 text-center mt-6">No hay registros.</p>;

  return (
    <table className="w-full mt-4 border-collapse">
      <thead>
        <tr className="bg-gray-100 text-sm">
          <th className="p-2 text-left">Nombre</th>
          <th className="p-2">CI</th>
          <th className="p-2">Colegio</th>
          <th className="p-2">Nota</th>
          <th className="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((c) => {
          const nota = c.evaluaciones?.[0]?.nota ?? null;
          //const idEvaluacion = c.evaluaciones?.[0]?.id_evaluacion ?? null;
          return (
            <tr
              key={c.competidor.id_competidor}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-2">
                {c.competidor.nombres} {c.competidor.apellidos}
              </td>
              <td className="p-2 text-center">{c.competidor.ci}</td>
              <td className="p-2 text-center">{c.competidor.escuela}</td>
              <td className="p-2 text-center">
                {nota !== null ? nota : '—'}
              </td>
              <td className="p-2 flex justify-center gap-2">
                {!nota ? (
                  <Button onClick={() => onEvaluar(c)} size="sm">
                    Evaluar
                  </Button>
                ) : (
                  <Button
                    onClick={() => onEditar(c)}
                    size="sm"
                    variant="outline"
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
