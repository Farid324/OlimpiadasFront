interface CardsSummaryProps {
  stats: {
    total: number;
    completadas: number;
    enProceso: number;
    pendientes: number;
  };
}

export default function CardsSummary({ stats }: CardsSummaryProps) {
  const { total, completadas, enProceso, pendientes } = stats || {};
  const items = [
    { label: 'Total', value: total, color: 'bg-gray-200' },
    { label: 'Completadas', value: completadas, color: 'bg-green-200' },
    { label: 'En proceso', value: enProceso, color: 'bg-yellow-200' },
    { label: 'Pendientes', value: pendientes, color: 'bg-red-200' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((i) => (
        <div key={i.label} className={`rounded-xl p-3 text-center ${i.color}`}>
          <p className="text-xs text-gray-600">{i.label}</p>
          <p className="text-lg font-semibold">{i.value ?? 0}</p>
        </div>
      ))}
    </div>
  );
}
