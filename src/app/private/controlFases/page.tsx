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

  if (loading && !data) {
    return (
      <div className="rounded-xl border bg-white p-6 text-slate-600">
        Cargando…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
            {error}
          </div>
        )}
        <div className="rounded-xl border bg-white p-6 text-slate-600">
          No hay datos para mostrar.
        </div>
      </div>
    );
  }

  const { kpis, filas } = data;

  return (
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
            {error}
          </div>
        )}

        {/* Header de página (igual al mockup) */}
      <section className="mb-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Control de Fases
        </h1>
        <p className="mt-1 text-slate-500">
          Gestión y aprobación de fases de evaluación por área
        </p>
      </section>

        {/* KPIs */}
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

        {/* Tabla */}
        <PhaseTable
          title="Estado de fases por Área"
          subtitle="Control y Aprobación de Fases de Evaluación"
          filas={filas}
          onRefresh={load}
        />
      </div>
  );
}
