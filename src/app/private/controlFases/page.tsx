// src/app/private/controlFases/page.tsx
"use client";

import { useEffect, useState } from "react";
import { usePageHeader } from "@/contexts/pageHeader";
import { fetchControlFases } from "@/components/controlFases/service";
import type { ControlFasesResponse } from "@/components/controlFases/types";
import StatCard from "@/components/controlFases/StatCard";
import PhaseTable from "@/components/controlFases/PhaseTable";
import { useAuth } from "@/hooks/useAuth";
import RoleGate from "@/components/features/RoleGate";

type PhaseTab = "CLASIFICACION" | "FINAL";

interface AppError {
  message?: string;
}

const PhaseTabsCF = ({
  active,
  onChange,
  shouldLoadFinal,
}: {
  active: PhaseTab;
  onChange: (p: PhaseTab) => void;
  shouldLoadFinal: () => void;
}) => (
  <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
    <button
      type="button"
      className={[
        "px-3 py-1 text-sm rounded-full transition",
        active === "CLASIFICACION"
          ? "bg-white text-black shadow"
          : "text-gray-600 hover:bg-white hover:text-black",
      ].join(" ")}
      onClick={() => {
        onChange("CLASIFICACION");
      }}
    >
      Fase Clasificatoria
    </button>
    <button
      type="button"
      className={[
        "px-3 py-1 text-sm rounded-full transition",
        active === "FINAL"
          ? "bg-white text-black shadow"
          : "text-gray-600 hover:bg-white hover:text-black",
      ].join(" ")}
      onClick={() => {
        onChange("FINAL");
        shouldLoadFinal();
      }}
    >
      Fase Final
    </button>
  </div>
);

export default function ControlFasesPage() {
  const { setTitle } = usePageHeader();
  const { user } = useAuth();

  const canApprove = user?.role === "RESPONSABLE_DE_AREA";

  const [activePhase, setActivePhase] = useState<PhaseTab>("CLASIFICACION");

  const [dataByPhase, setDataByPhase] = useState<{
    CLASIFICACION: ControlFasesResponse | null;
    FINAL: ControlFasesResponse | null;
  }>({
    CLASIFICACION: null,
    FINAL: null,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setTitle("Control de Fases"), [setTitle]);

  const load = async (phase: PhaseTab): Promise<void> => {
    try {
      setLoading(true);
      const d = await fetchControlFases(phase);
      setDataByPhase((prev) => ({ ...prev, [phase]: d }));
      setError(null);
    } catch (e: unknown) {
      const err = e as AppError;
      setError(err?.message || "No se pudo cargar la información.");
      setDataByPhase((prev) => ({ ...prev, [phase]: null }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load("CLASIFICACION");
  }, []);

  const data = dataByPhase[activePhase];

  // Vista de carga inicial
  if (loading && !data) {
    return (
      <RoleGate allow={["ADMINISTRADOR", "RESPONSABLE_DE_AREA"]}>
        <div className="p-0 sm:p-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-gray-600">
            Cargando…
          </div>
        </div>
      </RoleGate>
    );
  }

  // Vista cuando no hay datos
  if (!data) {
    return (
      <RoleGate allow={["ADMINISTRADOR", "RESPONSABLE_DE_AREA"]}>
        <div className="p-0 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
              {error}
            </div>
          )}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-gray-600">
            No hay datos para mostrar.
          </div>
        </div>
      </RoleGate>
    );
  }

  const { kpis, filas } = data;

  const title =
    activePhase === "CLASIFICACION"
      ? "Fase Clasificatoria – Estado por Área / Nivel"
      : "Fase Final – Estado por Área / Nivel";

  const subtitle =
    activePhase === "CLASIFICACION"
      ? "Control y aprobación de la fase clasificatoria por área"
      : "Control y aprobación de la fase final por área";

  return (
    <RoleGate allow={["ADMINISTRADOR", "RESPONSABLE_DE_AREA"]}>
      {/* Igual que la vista de Responsables: sin padding en móvil, con padding en desktop */}
      <div className="p-0 sm:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
            {error}
          </div>
        )}

        {/* Header + Tabs */}
        <section className="mb-2 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-black">Control de Fases</h1>
            <p className="mt-1 text-slate-500">
              Gestión y aprobación de fases de evaluación por área
            </p>
          </div>
        </section>

        {/* Tabs de fase — justo debajo del header, antes de los KPIs */}
        <div>
          <PhaseTabsCF
            active={activePhase}
            onChange={(p) => {
              setActivePhase(p);
            }}
            shouldLoadFinal={() => {
              if (!dataByPhase.FINAL) {
                void load("FINAL");
              }
            }}
          />
        </div>

        {/* KPIs – mismas columnas que en Responsables (2 en móvil, 4 en desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
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

        {/* Tabla – SIN card extra, PhaseTable se encarga del fondo blanco */}
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
          <PhaseTable
            title={title}
            subtitle={subtitle}
            filas={filas}
            onRefresh={() => load(activePhase)}
            phaseType={activePhase}
            canApprove={canApprove}
          />
        </div>
      </div>
    </RoleGate>
  );
}
