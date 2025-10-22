import { LuCircle } from 'react-icons/lu';
import type { FilaFase } from './types';
import ProgressBar from './ProgressBar';

export default function PhaseRow({ f }:{ f: FilaFase }) {
  const faseClass =
    f.faseActual === 'Completado' ? 'bg-green-100 text-green-700' :
    f.faseActual === 'Evaluación Final' ? 'bg-amber-100 text-amber-700' :
    'bg-blue-100 text-blue-700';

  const estadoClass =
    f.estado === 'Completado' ? 'bg-green-100 text-green-700' :
    f.estado === 'Listo para aprobar' ? 'bg-amber-100 text-amber-700' :
    'bg-gray-100 text-gray-700';

  const btnClass =
    f.accionColor === 'success' ? 'bg-green-100 text-green-700 cursor-default' :
    f.accionColor === 'neutral' ? 'bg-gray-100 text-gray-600 cursor-not-allowed' :
    'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <tr className="border-t">
      <td className="px-6 py-4">
        <div className="font-medium">{f.area}</div>
        <div className="text-xs text-gray-500">{f.nivel}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`rounded-full px-3 py-1 text-xs ${faseClass}`}>{f.faseActual}</span>
      </td>
      <td className="px-6 py-4"><ProgressBar done={f.progresoHecho} total={f.progresoTotal} /></td>
      <td className="px-6 py-4">
        <ul className="space-y-1 text-xs">
          <li className="flex items-center gap-1 text-emerald-600"><LuCircle/> Clasificados: {f.resumen.clasificados}</li>
          <li className="flex items-center gap-1 text-amber-600"><LuCircle/> No clasificados: {f.resumen.noClasificados}</li>
          <li className="flex items-center gap-1 text-red-600"><LuCircle/> Descalificados: {f.resumen.descalificados}</li>
        </ul>
      </td>
      <td className="px-6 py-4">
        <div>{f.responsable}</div>
        <div className="text-xs text-gray-500">{f.fechaHora}</div>
      </td>
      <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs ${estadoClass}`}>{f.estado}</span></td>
      <td className="px-6 py-4">
        <button type="button" onClick={() => {}} disabled={!!f.accionDisabled}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${btnClass}`}>
          {f.accionLabel ?? 'En progreso'}
        </button>
      </td>
    </tr>
  );
}
