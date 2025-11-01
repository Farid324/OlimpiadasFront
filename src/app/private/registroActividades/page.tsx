'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '@/libs/api';
import { Search, FileText, Edit, CheckCircle, Mail, Clock, User } from 'lucide-react';
import { usePageHeader } from '@/contexts/pageHeader';
import { Input } from '@/components/ui/Input';

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

  // 🔹 Cargar logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Log[]>('/logs', {
        params: {
          ...(q.trim() ? { usuario: q.trim() } : {}),
          ...(accion ? { accion } : {}),
        },
      });
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [q, accion]);

  useEffect(() => {
    setTitle('Registro de Actividades');
    fetchLogs();
  }, [fetchLogs, setTitle]);

  // 🔹 Métricas
  const metrics = useMemo(() => {
    const total = logs.length;
    const registros = logs.filter((l) => l.accion === 'REGISTRO').length;
    const modificaciones = logs.filter((l) => l.accion === 'MODIFICACION').length;
    return { total, registros, modificaciones };
  }, [logs]);

  // 🔹 Render
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-black">Registro de Actividades</h1>
        <p className="text-gray-500 text-sm">Historial de cambios y acciones del sistema</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CardMetric label="Total Actividades" value={metrics.total} icon={<Clock />} />
        <CardMetric label="Registros" value={metrics.registros} icon={<User />} />
        <CardMetric label="Modificaciones" value={metrics.modificaciones} icon={<Edit />} />
      </div>


      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Buscar */}
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por usuario..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 w-full rounded-md border-gray-300 text-gray-900"
          />
        </div>

        {/* Filtro acción */}
        <div className="relative w-full sm:w-1/4">
          <select
            className="w-full border rounded-md p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={accion}
            onChange={(e) => setAccion(e.target.value as 'REGISTRO' | 'MODIFICACION' | '')}
          >
            <option value="">Todas las acciones</option>
            <option value="REGISTRO">Registro</option>
            <option value="MODIFICACION">Modificación</option>
          </select>
        </div>
      </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-gray-700 mb-2">
            Actividades Registradas ({logs.length})
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Historial detallado de todas las acciones realizadas
          </p>

          {loading ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : logs.length === 0 ? (
            <div className="border rounded-md p-6 text-gray-500 text-center bg-gray-50">
          No hay registros {q ? 'para la búsqueda actual' : 'disponibles'}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto" tabIndex={0}>
          <table className="min-w-[1000px] border-collapse text-sm">
            <thead className="sticky top-0 bg-white z-10 border-b border-black">
              <tr className="text-gray-700">
            <th className="py-3 px-4 text-left font-semibold">Fecha/Hora</th>
            <th className="py-3 px-4 text-left font-semibold">Usuario</th>
            <th className="py-3 px-4 text-left font-semibold">Acción</th>
            <th className="py-3 px-4 text-left font-semibold">Objetivo</th>
            <th className="py-3 px-4 text-left font-semibold">Descripción</th>
            <th className="py-3 px-4 text-left font-semibold">Cambios</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((l) => {
            const initials = l.usuario
              ? l.usuario
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
              : '??';

            return (
              <tr key={l.id} className="border-b border-gray-200 hover:bg-gray-50">
                {/* Fecha */}
                <td className="py-4 px-4 text-gray-700">{l.fecha}</td>

                {/* Usuario */}
                <td className="py-3 px-4 flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold">
                {initials}
              </div>
              <span className="font-bold text-black break-normal">{l.usuario}</span>
                </td>

                {/* Acción */}
                <td className="py-4 px-4 text-left">
              {l.accion === 'REGISTRO' ? (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
                  <User className="w-4 h-4 mr-2" />
                  Registro
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                  <Edit className="w-4 h-4 mr-2" />
                  Modificación
                </span>
              )}
                </td>

                {/* Objetivo */}
                <td className="py-4 px-4 text-gray-800">{l.objetivo}</td>

                {/* Descripción */}
                <td className="py-4 px-4 text-gray-600">{l.descripcion || '—'}</td>

                {/* Cambios */}
                <td className="py-4 px-4 text-gray-600">{l.cambios || '—'}</td>
              </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- COMPONENTE: Tarjeta Métrica ---- */
function CardMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="text-black text-2xl">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-black">{value}</p>
    </div>
  );
}
