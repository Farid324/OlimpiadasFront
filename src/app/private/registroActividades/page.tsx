'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '@/libs/api';
import { Search, Edit, Clock, User } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6 text-gray-900">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-black">Registro de Actividades</h1>
        <p className="text-gray-500 text-sm">Historial de cambios y acciones del sistema</p>
      </div>

      {/* Métricas: 
         - MÓVIL (Intacto): grid-cols-2 con gap-2.
         - DESKTOP: md:grid-cols-3 con gap-6.
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
        <CardMetric label="Total Actividades" value={metrics.total} icon={<Clock />} />
        <CardMetric label="Registros" value={metrics.registros} icon={<User />} />
        
        {/* MÓVIL: col-span-2. DESKTOP: col-span-1 */}
        <div className="col-span-2 md:col-span-1">
            <CardMetric label="Modificaciones" value={metrics.modificaciones} icon={<Edit />} />
        </div>
      </div>

      {/* FILTROS
         - MÓVIL: flex-col.
         - DESKTOP: flex-row + flex-1 en el buscador para llenar espacio.
      */}
      <div className="flex flex-col md:flex-row gap-2 sm:gap-4 items-center">
        
        {/* ===== Buscar ===== */}
        <div className="w-full md:flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por usuario..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="
                w-full h-10 sm:h-12 pl-12 pr-10 rounded-lg bg-gray-50 border border-gray-200
                text-gray-800 placeholder:text-gray-400 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                transition
              "
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ===== Filtro acción ===== */}
        <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3">
          <div className="relative w-full">
            <select
              className="
                w-full h-10 sm:h-12 rounded-lg bg-gray-50 border border-gray-200 px-3 pr-10
                text-gray-900 text-sm appearance-none
                focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
              "
              value={accion}
              onChange={(e) => setAccion(e.target.value as 'REGISTRO' | 'MODIFICACION' | '')}
            >
              <option value="">Todas las acciones</option>
              <option value="REGISTRO">Registro</option>
              <option value="MODIFICACION">Modificación</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <h2 className="font-semibold text-gray-700 mb-2">
          Actividades Registradas ({logs.length})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Historial detallado de todas las acciones realizadas
        </p>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : logs.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center bg-gray-50">
            No hay registros {q ? 'para la búsqueda actual' : 'disponibles'}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto border border-gray-100 rounded-md">
            <div className="w-full overflow-x-auto" tabIndex={0}>
              <table className="min-w-[1000px] border-collapse text-sm">
                <thead className="sticky top-0 bg-white z-10 border-b border-gray-300 shadow-sm">
                  <tr className="text-gray-700 bg-gray-50/50">
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
                      ? l.usuario.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                      : '??';

                    return (
                      <tr key={l.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{l.fecha}</td>
                        <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                    {initials}
                                </div>
                                <span className="font-medium text-gray-900">{l.usuario}</span>
                            </div>
                        </td>
                        <td className="py-3 px-4 text-left">
                          {l.accion === 'REGISTRO' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                              <User className="w-3 h-3 mr-1.5" /> Registro
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                              <Edit className="w-3 h-3 mr-1.5" /> Modificación
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-800 font-medium">{l.objetivo}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate" title={l.descripcion}>{l.descripcion || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 italic max-w-[200px] truncate">{l.cambios || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- COMPONENTE: Tarjeta Métrica (Intacto) ---- */
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
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow h-24 sm:h-28 flex flex-col justify-between relative border border-gray-100">
      <div className="flex justify-between items-start">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
        <div className="text-gray-800 scale-75 sm:scale-100 origin-top-right">{icon}</div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}