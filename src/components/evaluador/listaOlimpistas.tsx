'use client';
import { Competidor } from '@/types/notas';
import { Button } from '@/components/ui/Button';

interface Props {
  data: Competidor[];
  onEvaluar: (c: Competidor) => void;
  onEditar: (c: Competidor) => void;
}

export default function CompetidorList({ data, onEvaluar, onEditar }: Props) {
  if (!data.length) return <p className="text-gray-400 text-center mt-6">No hay registros.</p>;

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
        {data.map(c => (
          <tr key={c.id_competidor} className="border-b hover:bg-gray-50">
            <td className="p-2">{c.nombres} {c.apellidos}</td>
            <td className="p-2 text-center">{c.ci}</td>
            <td className="p-2 text-center">{c.escuela}</td>
            <td className="p-2 text-center">{c.nota ?? '—'}</td>
            <td className="p-2 flex justify-center gap-2">
              {!c.nota ? (
                <Button onClick={() => onEvaluar(c)} size="sm">Evaluar</Button>
              ) : (
                <Button onClick={() => onEditar(c)} size="sm" variant="outline">Editar</Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
