'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import { Input } from '@/components/ui/Input';
import { Search, FileText, Edit, CheckCircle } from 'lucide-react';
import { usePageHeader } from '@/contexts/pageHeader';

type Log = {
  id: number;
  usuario: string;
  accion: 'REGISTRO' | 'MODIFICACION';
  objetivo: string;
  fecha: string;
  descripcion?: string;
  cambios?: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [q, setQ] = useState('');
  const [accion, setAccion] = useState<'REGISTRO' | 'MODIFICACION' | ''>('');
  const [loading, setLoading] = useState(false);
  const { setTitle } = usePageHeader();

  // 🔹 Función para cargar logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logs', {
        params: {
          ...(q.trim() ? { usuario: q.trim() } : {}),
          ...(accion ? { accion } : {}),
        },
      });
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error cargando logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar datos al montar el componente y al cambiar filtros
  useEffect(() => {
    setTitle('Registro de Actividades');
    fetchLogs();
  }, [q, accion, setTitle]);

  // 🔹 Métricas
  const metrics = useMemo(() => {
    if (!Array.isArray(logs)) return { total: 0, registros: 0, modificaciones: 0 };
    const total = logs.length;
    const registros = logs.filter((l) => l.accion === 'REGISTRO').length;
    const modificaciones = logs.filter((l) => l.accion === 'MODIFICACION').length;
    return { total, registros, modificaciones };
  }, [logs]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ---- Encabezado ---- */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Registro de Actividades</h1>
        <p className="text-gray-500 text-sm mt-1">
          Historial completo de cambios y actividades del sistema
        </p>
      </div>

      {/* ---- Métricas ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Total Actividades"
          value={metrics.total}
          subtitle="Últimas 24 horas"
          icon={<FileText />}
        />
        <MetricCard
          title="Evaluaciones"
          value={metrics.registros}
          subtitle="Registradas hoy"
          icon={<CheckCircle />}
          color="text-purple-600"
          badgeBg="bg-purple-50"
        />
        <MetricCard
          title="Modificaciones"
          value={metrics.modificaciones}
          subtitle="Cambios realizados"
          icon={<Edit />}
          color="text-blue-700"
          badgeBg="bg-blue-50"
        />
      </div>

      {/* ---- Filtros ---- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Input Usuario */}
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="w-full pl-9 rounded-lg border-gray-300 text-gray-900 placeholder:text-gray-400"
            placeholder="Buscar por usuario..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Dropdown Acción */}
        <div className="relative w-full sm:w-1/4">
          <select
            className="w-full mt-2 sm:mt-0 border rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={accion}
            onChange={(e) => setAccion(e.target.value as any)}
          >
            <option value="">Todas las acciones</option>
            <option value="REGISTRO">Registro</option>
            <option value="MODIFICACION">Modificación</option>
          </select>
        </div>




        {/* Botón Exportar */}
        <button className="mt-2 sm:mt-0 inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-sm text-gray-700 px-4 py-2 rounded-lg shadow-sm transition">
          <FileText className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* ---- Tabla ---- */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="font-semibold text-gray-700 mb-1">
          Registro de Actividades ({logs.length})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Historial detallado de todas las acciones realizadas en el sistema
        </p>

        {loading ? (
          <p className="text-center text-gray-500 py-6">Cargando...</p>
        ) : logs.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-gray-500 bg-gray-50">
            No hay registros disponibles
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[450px]">
            <table className="min-w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="py-2 px-4 font-medium">Fecha/Hora</th>
                  <th className="py-2 px-4 font-medium">Usuario</th>
                  <th className="py-2 px-4 font-medium">Acción</th>
                  <th className="py-2 px-4 font-medium">Objetivo</th>
                  <th className="py-2 px-4 font-medium">Descripción</th>
                  <th className="py-2 px-4 font-medium">Cambios</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, idx) => (
                  <tr key={l.id ?? idx} className="bg-white shadow-sm rounded-md">
                    <td className="py-2 px-4 text-gray-600">{l.fecha}</td>
                    <td className="py-2 px-4 font-medium text-gray-900">{l.usuario}</td>
                    <td className="py-2 px-4">
                      {l.accion === 'REGISTRO' ? (
                        <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
                          Evaluación registrada
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                          Puntuación modificada
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-gray-700">{l.objetivo}</td>
                    <td className="py-2 px-4 text-gray-600">{l.descripcion || '—'}</td>
                    <td className="py-2 px-4 text-gray-600">{l.cambios || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- COMPONENTE: Tarjeta de Métrica ---- */
function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  badgeBg,
}: {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: React.ReactNode;
  color?: string;
  badgeBg?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-5 relative`}>
      <div
        className={`absolute top-5 right-5 p-2 rounded-full ${badgeBg || 'bg-gray-100'} ${
          color || 'text-gray-700'
        }`}
      >
        <div className="[&>*]:w-5 [&>*]:h-5">{icon}</div>
      </div>
      <h3 className="text-gray-900 text-sm font-semibold">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
    </div>
  );
}

