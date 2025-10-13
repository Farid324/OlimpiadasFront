'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LuUsers, LuUserCog, LuLayers, LuAward } from 'react-icons/lu';
import AddEvaluatorModal from '@/components/features/RegistroEva/AddEvaluatorModal';
import { usePageHeader } from '@/contexts/pageHeader';
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
  const { setTitle } = usePageHeader();

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

  useEffect(() => {
    setTitle('Evaluadores');
  }, [setTitle]);

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

  return (
    <div className="p-6 space-y-5">
      {/* Cards */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardMetric label="Total Evaluadores" value={metrics.total} icon={<LuUsers />} />
          <CardMetric label="Evaluadores Activos" value={metrics.activos} icon={<LuUserCog />} />
          <CardMetric label="Áreas Cubiertas" value={metrics.areasCubiertas} icon={<LuLayers />} />
          <CardMetric label="Promedio Experiencia" value={`${metrics.promExp} años`} icon={<LuAward />} />
        </div>

        <div>
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            + Agregar Evaluador
          </Button>
        </div>
      </section>

      {/* Buscador */}
      <section className="flex items-center gap-3">
        <Input
          className="text-gray-900 placeholder:text-gray-400"
          placeholder="Buscar por nombre, apellido, correo o institución…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </section>

      {/* Tabla */}
      <section className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <Th>Nombre</Th>
                <Th>Correo</Th>
                <Th>Institución</Th>
                <Th>Especialidad</Th>
                <Th>Exp.</Th>
                <Th>Áreas</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">Cargando…</td>
                </tr>
              ) : evaluadores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No hay evaluadores {q ? 'para la búsqueda actual' : 'registrados'}.
                  </td>
                </tr>
              ) : (
                evaluadores.map((e) => (
                  <tr key={e.id_usuario} className="border-t">
                    <Td>
                      <div className="font-semibold">{e.nombre} {e.apellido}</div>
                      <div className="text-xs text-gray-500">{e.telefono || ''}</div>
                    </Td>
                    <Td><span className="text-gray-900">{e.correo}</span></Td>
                    <Td>{e.institucion || '-'}</Td>
                    <Td>{e.especialidad || '-'}</Td>
                    <Td>{typeof e.experiencia === 'number' ? e.experiencia : 0}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {e.evaluadores_area?.length ? (
                          e.evaluadores_area.map(({ area }) => (
                            <span
                              key={area.id_area}
                              className="px-2 py-0.5 text-xs rounded-full bg-gray-900 text-white"
                              title={area.nombre_area}
                            >
                              {area.nombre_area}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className={`px-2 py-0.5 text-xs rounded ${e.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <AddEvaluatorModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); refetch(); }}
        />
      )}
    </div>
  );
}

/* helpers UI inline */
function CardMetric({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4 flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-3 py-3">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-3 align-top">{children}</td>;
}
