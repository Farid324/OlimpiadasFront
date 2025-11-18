// src/app/private/controlFases/responsables/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchControlFasesResp } from "@/components/controlFases/responsable/service";
import type { ControlFasesRespPayload } from "@/components/controlFases/responsable/types";
import StatCardResp from "@/components/controlFases/responsable/StatCardResp";
import PhaseTableResp from "@/components/controlFases/responsable/PhaseTableResp";

type AppError = { message?: string };

export default function ControlFasesResponsablePage() {
  const [data, setData] = useState<ControlFasesRespPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (): Promise<void> => {
    try {
      setLoading(true);
      const d = await fetchControlFasesResp();
      setData(d);
      setError(null);
    } catch (e) {
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
        <h1 className="text-2xl font-bold text-black">
          Control de Fases
        </h1>
        <p className="mt-1 text-slate-500">
          Gestión y aprobación de fases de evaluación por área
        </p>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardResp
          title="Evaluaciones Completadas"
          value={kpis.evaluacionesCompletadas.valor}
          subtitle={`de ${kpis.evaluacionesCompletadas.total} totales`}
        />
        <StatCardResp
          title="Fases Completadas"
          value={kpis.fasesCompletadas.valor}
          subtitle={`de ${kpis.fasesCompletadas.total} áreas`}
        />
        <StatCardResp
          title="Aprobaciones Pendientes"
          value={kpis.aprobacionesPendientes.valor}
          subtitle={kpis.aprobacionesPendientes.nota}
        />
        <StatCardResp
          title="Progreso General"
          value={`${kpis.progresoGeneral.porcentaje}%`}
          subtitle={kpis.progresoGeneral.nota}
        />
      </div>

      <PhaseTableResp
        title="Mis áreas"
        subtitle="Fases de evaluación de las áreas a tu cargo"
        filas={filas}
        onRefresh={load}
      />
    </div>
  );
}
