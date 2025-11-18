// src/app/private/controlFases/responsables/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  fetchControlFasesResp,
} from "@/components/controlFases/responsable/service";
import type {
  ControlFasesRespPayload,
} from "@/components/controlFases/responsable/types";
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
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
          {error}
        </div>
      )}

      {/* Header de página (igual al mockup + tabs) */}
      <section className="mb-2 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-black">Control de Fases</h1>
          <p className="mt-1 text-slate-500">
            Gestión y aprobación de fases de evaluación por área
          </p>
        </div>

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
      </section>

      {/* Banner de bloqueo cuando ya no hay nada por hacer */}
      {locked && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800 text-sm">
          <strong>Fases completadas.</strong> {lockedMessage}
        </div>
      )}

      {/* Contenido (KPIs + Tabla), con lock visual si todo está completado */}
      <div
        className={
          locked
            ? "space-y-6 opacity-50 pointer-events-none select-none"
            : "space-y-6"
        }
      >
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
          title={title}
          subtitle={subtitle}
          filas={filas}
          onRefresh={() => load(activePhase)}
        />
      </div>
    </div>
  );
}
