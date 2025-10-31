interface ProgressBarProps {
  completadas: number;
  total: number;
}

export default function ProgressBar({ completadas, total }: ProgressBarProps) {
  const percent = total ? Math.round((completadas / total) * 100) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
      <div
        className="h-3 rounded-full bg-blue-500 transition-all"
        style={{ width: `${percent}%` }}
      />
      <p className="text-sm text-gray-500 mt-1">{percent}% completado</p>
    </div>
  );
}
