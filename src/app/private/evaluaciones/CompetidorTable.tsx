import { CompetidorInscripcionAdmin } from '@/types/notas';

interface CompetidorTableProps {
  data: CompetidorInscripcionAdmin[];
  onView: (c: CompetidorInscripcionAdmin) => void;
}

export default function CompetidorTable({ data, onView }: CompetidorTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Olimpista</th>
            <th className="px-4 py-2">Área</th>
            <th className="px-4 py-2">Nivel</th>
            <th className="px-4 py-2">Evaluador</th>
            <th className="px-4 py-2">Nota</th>
            <th className="px-4 py-2">Estado</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((c: CompetidorInscripcionAdmin) => {
            const ev = c.evaluaciones?.[0];
            const estado = ev?.estado_registro ?? 'PENDIENTE';
            const color =
              estado === 'FIRMADA'
                ? 'text-green-600'
                : estado === 'BORRADOR'
                ? 'text-yellow-600'
                : 'text-gray-500';
            return (
              <tr key={c.id_inscripcion} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  {c.competidor.nombres} {c.competidor.apellidos}
                </td>
                <td className="px-4 py-2">{c.area?.nombre_area}</td>
                <td className="px-4 py-2">{c.nivel?.nombre_nivel}</td>
                <td className="px-4 py-2">{ev?.evaluador?.nombre ?? '—'}</td>
                <td className="px-4 py-2">{ev?.nota ?? '—'}</td>
                <td className={`px-4 py-2 font-medium ${color}`}>{estado}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => onView(c)}
                    className="text-blue-600 hover:underline font-medium"
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
