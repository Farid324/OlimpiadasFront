interface ProgressBarProps {
  completadas: number | string;
  enProceso: number | string;
  total: number | string;
  nombreArea?: string;
  nombreNivel?: string;
}

export default function ProgressBar({
  completadas,
  enProceso,
  total,
  nombreArea,
  nombreNivel,
}: ProgressBarProps) {
  const completadasNum = Number(completadas) || 0;
  const enProcesoNum = Number(enProceso) || 0;
  const totalNum = Number(total) || 0;

  const totalEvaluaciones = completadasNum + enProcesoNum;
  const percent = totalNum ? Math.round((totalEvaluaciones / totalNum) * 100) : 0;

  const titulo =
    nombreArea && nombreNivel
      ? `Progreso de Evaluaciones - ${nombreArea} (${nombreNivel})`
      : nombreArea
      ? `Progreso de Evaluaciones - ${nombreArea}`
      : 'Progreso de Evaluaciones';

  return (
    <div className="w-full space-y-2 bg-white rounded-lg shadow p-4 h-28">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-800 mb-1">{titulo}</h1>
        <p className="text-sm text-gray-500">
          {percent.toFixed(1)}% completado ({totalEvaluaciones} de {totalNum})
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-gray-900 transition-[width] duration-700 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
