'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LuUsers, LuUserCog, LuLayers, LuAward } from 'react-icons/lu';
import { Mail, Phone } from 'lucide-react';
import AddEvaluatorModal from '@/components/features/RegistroEva/AddEvaluatorModal';

type Area = { id_area: number; nombre_area: string };
type Evaluador = {
  id_usuario: number;
  nombre: string;
  apellido: string;             // si en tu DB es 'apellidos', cámbialo aquí
  correo: string;
  telefono?: string | null;
  institucion?: string | null;
  especialidad?: string | null; // si es 'especializacion', cámbialo aquí
  experiencia?: number | null;
  activo?: boolean | null;
  evaluadores_area?: { area: Area }[];
};

export default function EvaluadoresPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([]);
  const [showModal, setShowModal] = useState(false);

  async function load(query?: string) {
    setLoading(true);
    try {
      const { data } = await api.get<Evaluador[]>('/evaluadores', {
        params: query ? { q: query } : undefined,
      });
      setEvaluadores(Array.isArray(data) ? data : []);
    } catch {
      setEvaluadores([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const qq = q.trim();
      load(qq ? qq : undefined);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const metrics = useMemo(() => {
    const total = evaluadores.length;
    const activos = evaluadores.filter((e) => !!e.activo).length;
    const areasSet = new Set<number>();
    let sumExp = 0;
    for (const e of evaluadores) {
      e.evaluadores_area?.forEach(({ area }) => areasSet.add(area.id_area));
      sumExp += e.experiencia ?? 0;
    }
    return {
      total,
      activos,
      areasCubiertas: areasSet.size,
      promExp: total ? Math.round(sumExp / total) : 0,
    };
  }, [evaluadores]);

  const refetch = () => load(q.trim() || undefined);
  const filtered = q ? evaluadores.filter(filtra(q)) : evaluadores;

  return (
    <div className="p-6 space-y-6 overflow-hidden">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Evaluadores</h1>
        <p className="text-gray-500 text-sm">Administración de Evaluadores por Área de competencia</p>
      </div>

      {/* Cards (mismo estilo que tu referencia) */}
      <div className="grid grid-cols-4 gap-6">
        <CardMetric label="Total Evaluadores" value={metrics.total} icon={<LuUsers />} />
        <CardMetric label="Evaluadores Activos" value={metrics.activos} icon={<LuUserCog />} />
        <CardMetric label="Áreas Cubiertas" value={metrics.areasCubiertas} icon={<LuLayers />} />
        <CardMetric label="Promedio Experiencia" value={`${metrics.promExp} años`} icon={<LuAward />} />
      </div>

      {/* Botón */}
      <div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
          + Agregar Evaluador
        </Button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3">
        <Input
          className="text-gray-900 placeholder:text-gray-400"
          placeholder="Buscar por nombre, apellido, correo o institución…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Tabla – ajustes finos para igualar la referencia */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-700 mb-2">Evaluadores Registrados ({filtered.length})</h2>
        <p className="text-sm text-gray-500 mb-4">Lista completa de evaluadores por área de competencia</p>

        {loading ? (
          <p className="text-gray-500 text-center">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center">
            No hay evaluadores {q ? 'para la búsqueda actual' : 'registrados'}
          </div>
        ) : (
          <div className="max-h-[450px] overflow-y-auto overflow-x-hidden">
            <table className="min-w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10 border-b border-black">
                <tr className="text-gray-700">
                  <th className="py-3 px-4 text-left font-semibold">Evaluador</th>
                  <th className="py-3 px-4 text-left font-semibold">Contacto</th>
                  <th className="py-3 px-4 text-left font-semibold">Especialización</th>
                  <th className="py-3 px-4 text-left font-semibold">Áreas</th>
                  <th className="py-3 px-4 text-left font-semibold">Institución</th>
                  <th className="py-3 px-4 text-left font-semibold">Experiencia</th>
                  <th className="py-3 px-4 text-center font-semibold">Rol</th>
                  <th className="py-3 px-4 text-center font-semibold">Activo</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((e) => {
                  <tr key={e.id_usuario} className="border-b border-gray-200"></tr>
                  const initials = (e.nombre?.[0] || '').concat(e.apellido?.[0] || '').toUpperCase() || 'EV';
                  return (
                    <tr key={e.id_usuario} className="border-b border-gray-200">
                      {/* Evaluador */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold">
                            {initials}
                          </div>
                          <span className="font-bold text-black break-normal">
                            {e.nombre} {e.apellido}
                          </span>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="py-4 px-4 text-gray-800">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-black" />
                          <span className="truncate">{e.correo}</span>
                        </div>
                        {e.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-black" /> {e.telefono}
                          </div>
                        )}
                      </td>

                      {/* Especialización */}
                      <td className="py-4 px-4 text-black">{e.especialidad || '-'}</td>

                      {/* Áreas (chips estilo referencia) */}
                      <td className="py-4 px-4">
                        {e.evaluadores_area?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {e.evaluadores_area.map(({ area }) => (
                              <span
                                key={area.id_area}
                                className="px-2 py-1 rounded-md bg-gray-200 text-black text-xs font-bold"
                              >
                                {area.nombre_area}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Institución */}
                      <td className="py-4 px-4 whitespace-normal text-black break-words">
                        {e.institucion || '-'}
                      </td>

                      {/* Experiencia */}
                      <td className="py-4 px-4 text-black">
                        {typeof e.experiencia === 'number' ? `${e.experiencia} años` : '-'}
                      </td>

                      {/* Rol (chip azul) */}
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                          Evaluador
                        </span>
                      </td>

                      {/* Estado (chip verde/rojo) */}
                      <td className="py-4 px-4 text-center">
                        {e.activo ? (
                          <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-bold">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs font-bold">
                            Inactivo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddEvaluatorModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

/** Filtro auxiliar (como en la referencia, aplicado a evaluadores) */
function filtra(q: string) {
  const s = q.toLowerCase();
  return (e: Evaluador) =>
    e.nombre?.toLowerCase().includes(s) ||
    e.apellido?.toLowerCase().includes(s) ||
    e.correo?.toLowerCase().includes(s) ||
    e.institucion?.toLowerCase().includes(s);
}

/* helpers UI inline – Cards con el estilo del ejemplo */
function CardMetric({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow relative h-28">
      <div className="absolute top-4 right-4 text-black text-3xl">
        <div className="[&>*]:w-6 [&>*]:h-6">{icon}</div>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-black mt-2">{value}</p>
    </div>
  );
}
