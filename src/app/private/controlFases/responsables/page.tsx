// src/app/private/controlFases/responsables/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchControlFasesResp } from "@/components/controlFases/responsable/service";
import type { ControlFasesRespPayload } from "@/components/controlFases/responsable/types";
import StatCardResp from "@/components/controlFases/responsable/StatCardResp";
import PhaseTableResp from "@/components/controlFases/responsable/PhaseTableResp";

type AppError = { message?: string };
type PhaseTab = "CLASIFICACION" | "FINAL";

const PhaseTabsResp = ({
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
      onClick={() => onChange("CLASIFICACION")}
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

export default function ControlFasesResponsablePage() {
  const [activePhase, setActivePhase] = useState<PhaseTab>("CLASIFICACION");

  const [dataByPhase, setDataByPhase] = useState<{
    CLASIFICACION: ControlFasesRespPayload | null;
    FINAL: ControlFasesRespPayload | null;
  }>({
    CLASIFICACION: null,
    FINAL: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (phase: PhaseTab): Promise<void> => {
    try {
      setLoading(true);
      const d = await fetchControlFasesResp(phase);
      setDataByPhase((prev) => ({ ...prev, [phase]: d }));
      setError(null);
    } catch (e) {
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

  // 👉 Vista de carga inicial, con padding responsivo igual que en admin
  if (loading && !data) {
    return (
      <div className="p-0 sm:p-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-slate-600">
          Cargando…
        </div>
      </div>
    );
  }

  // 👉 Vista cuando no hay datos
  if (!data) {
    return (
      <div className="p-0 sm:p-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-slate-600">
          No hay datos para mostrar.
        </div>
      </div>
    );
  }

  const { kpis, filas } = data;

  // 🔒 Lógica de “bloqueo” para responsables (por fase activa)
  const locked =
    filas.length > 0 &&
    filas.every((f) => f.estado === "Completado" && !!f.accionDisabled);

  const lockedMessage =
    "Todas las fases de las áreas a tu cargo han sido cerradas y validadas. Ya no hay acciones pendientes.";

  const title =
    activePhase === "CLASIFICACION"
      ? "Mis áreas – Fase Clasificatoria"
      : "Mis áreas – Fase Final";

  const subtitle =
    activePhase === "CLASIFICACION"
      ? "Fases de evaluación clasificatoria de las áreas a tu cargo"
      : "Fases de evaluación final de las áreas a tu cargo";

  return (
    // 👉 Igual que la vista de admin: sin padding en móvil, padding en desktop
    <div className="p-0 sm:p-6 space-y-6">
      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
          {error}
        </div>
      )}

      {/* Header de página + tabs */}
      <section className="mb-2 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-black">Control de Fases</h1>
          <p className="text-gray-500 text-sm">
            Gestión y aprobación de fases de evaluación por área
          </p>
        </div>
      </section>

      {/* Tabs de fase — justo debajo del header, antes de los KPIs */}
      <div className="mb-2">
        <PhaseTabsResp
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

      {/* Banner de bloqueo cuando ya no hay nada por hacer */}
      {locked && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800 text-sm">
          <strong>Fases completadas.</strong> {lockedMessage}
        </div>
      )}

      {/* Contenido (KPIs + Tabla) */}
      <div
        className={
          locked
            ? "space-y-6 opacity-50 pointer-events-none select-none"
            : "space-y-6"
        }
      >
        {/* KPIs – mismas columnas que en la vista admin */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
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

        {/* Tabla – PhaseTableResp se encarga del fondo blanco y títulos de columnas */}
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
          <PhaseTableResp
            title={title}
            subtitle={subtitle}
            filas={filas}
            onRefresh={() => load(activePhase)}
            phaseType={activePhase}
        />
        </div>
      </div>
    </div>
  );
}
