import { CheckCircle, Clock, Circle, FileText } from "lucide-react";

interface CardsSummaryProps {
  stats: {
    total: number;
    completadas: number;
    enProceso: number;
    pendientes: number;
  };
}

export default function CardsSummary({ stats }: CardsSummaryProps) {
  const items = [
    { label: "Total Evaluaciones", value: stats.total, icon: FileText, color: "text-gray-600" },
    { label: "Completadas", value: stats.completadas, icon: CheckCircle, color: "text-green-600" },
    { label: "En Proceso", value: stats.enProceso, icon: Clock, color: "text-yellow-600" },
    { label: "Pendientes", value: stats.pendientes, icon: Circle, color: "text-gray-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white rounded-lg shadow p-4 h-28 w-full"
        >
          <div className="flex items-start justify-between w-full">
            <p className="text-sm text-gray-500">{label}</p>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2 text-left">
            {value ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}
