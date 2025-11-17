// src/app/private/controlFases/page.tsx
"use client";

import { useEffect, useState } from "react";
import { usePageHeader } from "@/contexts/pageHeader";
import { fetchControlFases } from "@/components/controlFases/service";
import type { ControlFasesResponse } from "@/components/controlFases/types";
import StatCard from "@/components/controlFases/StatCard";
import PhaseTable from "@/components/controlFases/PhaseTable";

// Tipo genérico para errores
interface AppError {
  message?: string;
}

export default function ControlFasesPage() {
  const { setTitle } = usePageHeader();
  const [data, setData] = useState<ControlFasesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => setTitle("Control de Fases"), [setTitle]);

  const load = async (): Promise<void> => {
    try {
      setLoading(true);
      const d = await fetchControlFases();
      setData(d);
      setError(null);
    } catch (e: unknown) {
      const err = e as AppError;
      setError(err?.message || "No se pudo cargar la información.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Estado de carga inicial (mismo look de card blanca)
  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-4 text-gray-600">
          Cargando…
        </div>
      </div>
    );
  }

  // Estado sin datos (mismo estilo de tarjetas)
  if (!data) {
    return (
      <div className="p-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-4 text-gray-600">
          No hay datos para mostrar.
        </div>
      </div>
    );
  }

  const { kpis, filas } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Mensaje de error (si lo hay) */}
      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
          {error}
        </div>
      )}

      {/* Header de página (alineado con Responsables / Evaluaciones) */}
      <div>
        <h1 className="text-2xl font-bold text-black">Control de Fases</h1>
        <p className="text-gray-500 text-sm">
          Gestión y aprobación de fases de evaluación por área
        </p>
      </div>

      {/* KPIs en grid, manteniendo el mismo tipo de separación y estilo de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Tabla dentro de una card blanca, como en Responsables/Evaluaciones */}
      <div className="bg-white rounded-lg shadow p-4">
        <PhaseTable
          title="Estado de fases por Área"
          subtitle="Control y Aprobación de Fases de Evaluación"
          filas={filas}
          onRefresh={load}
        />
      </div>
    </div>
  );
}
