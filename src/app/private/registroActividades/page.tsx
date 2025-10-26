'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import { Input } from '@/components/ui/Input';
import { Search, FileText, Edit, CheckCircle } from 'lucide-react';
import { usePageHeader } from '@/contexts/pageHeader';

type Log = {
  id_log: number;
  usuario: string;
  accion: 'REGISTRO' | 'MODIFICACIÓN';
  entidad: string;
  fecha: string;
  descripcion?: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTitle } = usePageHeader();

  // 🔹 Cargar datos y manejar búsqueda
  useEffect(() => {
    setTitle('Registro de Actividades');

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/logs', {
          params: q.trim() ? { q: q.trim() } : {},
        });

        // Asegurarse de que res.data sea un arreglo
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Error cargando logs:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      fetchLogs();
    }, 300); // Pequeño delay para debounce de búsqueda

    return () => clearTimeout(timeout);
  }, [q]);

  // 🔹 Métricas
  const metrics = useMemo(() => {
    if (!Array.isArray(logs)) return { total: 0, registros: 0, modificaciones: 0 };

    const total = logs.length;
    const registros = logs.filter((l) => l.accion === 'REGISTRO').length;
    const modificaciones = logs.filter((l) => l.accion === 'MODIFICACIÓN').length;

    return { total, registros, modificaciones };
  }, [logs]);

  return (
    <div className="p-6 space-y-6 overflow-hidden">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-black">Registro de Actividades</h1>
        <p className="text-gray-500 text-sm">Historial de registro y modificación de notas</p>
      </div>

      {/* Cards métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CardMetric label="Total Acciones" value={metrics.total} icon={<FileText />} />
        <CardMetric
          label="Registros"
          value={metrics.registros}
          icon={<CheckCircle />}
          color="text-green-700"
          bg="bg-green-100"
        />
        <CardMetric
          label="Modificaciones"
          value={metrics.modificaciones}
          icon={<Edit />}
        />
      </div>

      {/* Buscador */}
      <div className="relative max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <Input
          className="w-full pl-9 text-gray-900 placeholder:text-gray-400"
          placeholder="Buscar por usuario, acción o descripción..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-700 mb-2">Historial de cambios ({logs.length})</h2>
        <p className="text-sm text-gray-500 mb-4">
          Acciones registradas en el sistema (registro o modificación de notas)
        </p>

        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : logs.length === 0 ? (
          <div className="border rounded-md p-6 text-center text-gray-500">
            No hay registros disponibles
          </div>
        ) : (
          <div className="max-h-[450px] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] text-sm border-collapse">
                <thead className="sticky top-0 bg-white z-10 border-b border-black">
                  <tr className="text-gray-700">
                    <th className="py-3 px-4 text-left font-semibold">Usuario</th>
                    <th className="py-3 px-4 text-left font-semibold">Acción</th>
                    <th className="py-3 px-4 text-left font-semibold">Entidad</th>
                    <th className="py-3 px-4 text-left font-semibold">Descripción</th>
                    <th className="py-3 px-4 text-left font-semibold">Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id_log} className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900 font-semibold">{l.usuario}</td>
                      <td className="py-3 px-4">
                        {l.accion === 'REGISTRO' ? (
                          <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-bold">
                            REGISTRO
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs font-bold">
                            MODIFICACIÓN
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-800">{l.entidad}</td>
                      <td className="py-3 px-4 text-gray-700">{l.descripcion || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(l.fecha).toLocaleString('es-BO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- COMPONENTE INTERNO PARA LAS TARJETAS ---- */
function CardMetric({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow relative h-28 ${bg || ''}`}>
      <div className={`absolute top-4 right-4 text-3xl ${color || 'text-black'}`}>
        <div className="[&>*]:w-6 [&>*]:h-6">{icon}</div>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-black mt-2">{value}</p>
    </div>
  );
}
