'use client';

import { useEffect, useState } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import { fetchControlFases } from '@/components/controlFases/service';
import type { ControlFasesResponse } from '@/components/controlFases/types';
import StatCard from '@/components/controlFases/StatCard';
import PhaseTable from '@/components/controlFases/PhaseTable';

export default function ControlFasesPage() {
  const { setTitle } = usePageHeader();
  const [data, setData] = useState<ControlFasesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setTitle('Control de Fases'), [setTitle]);

  useEffect(() => {
    fetchControlFases()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (!data) {
    return <div className="rounded-xl border bg-white p-6 text-slate-600">Cargando…</div>;
  }

  const { kpis, filas } = data;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
          Mostrando datos de ejemplo (sin conexión al backend).
        </div>
      )}

      {/* KPIs: 1 col (móvil), 2 cols (tablet), 4 cols (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Evaluaciones Completadas"
          value={kpis.evaluacionesCompletadas.valor}
          subtitle={`de ${kpis.evaluacionesCompletadas.total} totales`}
        />
        <StatCard
          title="Fases Completadas"
          value={kpis.fasesCompletadas.valor}
          subtitle={`de ${kpis.fasesCompletadas.total} áreas`}
        />
        <StatCard
          title="Aprobaciones Pendientes"
          value={kpis.aprobacionesPendientes.valor}
          subtitle={kpis.aprobacionesPendientes.nota}
        />
        <StatCard
          title="Progreso General"
          value={`${kpis.progresoGeneral.porcentaje}%`}
          subtitle={kpis.progresoGeneral.nota}
        />
      </div>

      {/* Tabla / Cards responsive */}
      <PhaseTable
        title="Estado de fases por Área"
        subtitle="Control y Aprobación de Fases de Evaluación"
        filas={filas}
      />
    </div>
  );
}
