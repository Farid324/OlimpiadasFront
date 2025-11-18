// src/app/private/reportes/tabs/certificados/index.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/libs/api";
import {
  exportCertificadosPremiados,
  exportCertificadosParticipacion,
} from "@/components/reportes/service";

import { FiChevronDown, FiDownload } from "react-icons/fi";
import { FiFileText } from "react-icons/fi";

type AreaDTO = { id: number; nombre: string };
type NivelDTO = { id: number; nombre: string };

type Filters = {
  id_area: number | null;
  id_nivel: number | null;
};

const NIVEL_ORDER: Record<string, number> = { Secundaria: 0, Primaria: 1 };
const STORAGE_KEY = "reportes:certificados:filters:v1";

const pick = (o: Record<string, unknown> | null | undefined, keys: string[]) =>
  keys.map((k) => o?.[k]).find((v) => v !== undefined && v !== null);

function mapCatalog<T extends { id: number; nombre: string }>(
  data: unknown,
  idKeys: string[],
  nameKeys: string[]
): T[] {
  const arr = (Array.isArray(data) ? data : []) as ReadonlyArray<
    Record<string, unknown>
  >;
  return arr
    .map(
      (r) =>
        ({
          id: Number(pick(r, idKeys)),
          nombre: String(pick(r, nameKeys) ?? "").trim(),
        } as T)
    )
    .filter((x) => !Number.isNaN(x.id) && x.nombre.length > 0);
}

export default function CertificadosTab() {
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [niveles, setNiveles] = useState<NivelDTO[]>([]);
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === "undefined") {
      return { id_area: null, id_nivel: null };
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Filters;
    } catch {}
    return { id_area: null, id_nivel: null };
  });

  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [downPremiados, setDownPremiados] = useState(false);
  const [downParticipacion, setDownParticipacion] = useState(false);
  const [confirmType, setConfirmType] = useState<
    "PREMIADOS" | "PARTICIPACION" | null
  >(null);
  const [loadingExport, setLoadingExport] = useState(false);

  // labels para el modal
  const getAreaLabel = () =>
    filters.id_area == null
      ? "—"
      : filters.id_area === 0
      ? "Todas las áreas"
      : areas.find((a) => a.id === filters.id_area)?.nombre ??
        String(filters.id_area);

  const getNivelLabel = () =>
    filters.id_nivel == null
      ? "—"
      : filters.id_nivel === 0
      ? "Todos los niveles"
      : niveles.find((n) => n.id === filters.id_nivel)?.nombre ??
        String(filters.id_nivel);

  const tipoLabel =
    confirmType === "PREMIADOS"
      ? "Certificados de Premiación"
      : "Certificados de Participación";

  // cargar catálogos
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoadingCatalogs(true);
        const [aRes, nRes] = await Promise.all([
          api.get("/areas"),
          api.get("/niveles"),
        ]);

        if (!cancel) {
          setAreas(
            mapCatalog<AreaDTO>(
              aRes.data,
              ["id_area", "id", "value"],
              ["nombre_area", "nombre", "label"]
            )
          );
          setNiveles(
            mapCatalog<NivelDTO>(
              nRes.data,
              ["id_nivel", "id", "value"],
              ["nombre_nivel", "nombre", "label"]
            ).sort(
              (x, y) =>
                (NIVEL_ORDER[x.nombre] ?? 99) - (NIVEL_ORDER[y.nombre] ?? 99)
            )
          );
        }
      } finally {
        if (!cancel) setLoadingCatalogs(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {}
  }, [filters]);

  const handleExportPremiados = async () => {
    try {
      setLoadingExport(true);
      const blob = await exportCertificadosPremiados({
        id_area: filters.id_area ?? undefined,
        id_nivel: filters.id_nivel ?? undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificados-premiados_${filters.id_area ?? "todas"}_${
        filters.id_nivel ?? "todos"
      }.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al exportar premiados:", e);
      alert("No se pudo exportar los certificados de premiación.");
    } finally {
      setLoadingExport(false);
    }
  };

  const handleExportParticipacion = async () => {
    try {
      setLoadingExport(true);
      const blob = await exportCertificadosParticipacion({
        id_area: filters.id_area ?? undefined,
        id_nivel: filters.id_nivel ?? undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificados-participacion_${filters.id_area ?? "todas"}_${
        filters.id_nivel ?? "todos"
      }.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al exportar participación:", e);
      alert("No se pudo exportar los certificados de participación.");
    } finally {
      setLoadingExport(false);
    }
  };

  const disable = loadingCatalogs;

  {
    confirmType && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setConfirmType(null)}
        />

        {/* Card */}
        <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl">
          {/* Close */}
          <button
            onClick={() => setConfirmType(null)}
            aria-label="Cerrar"
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            ✕
          </button>

          {/* Header */}
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-base font-semibold text-slate-900">
              Exportar {tipoLabel}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Se exportará un Excel con los filtros seleccionados.
            </p>
          </div>

          {/* Resumen */}
          <div className="px-5 mt-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50">
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <div className="text-xs text-gray-400">Área</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {getAreaLabel()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Nivel</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {getNivelLabel()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Tipo de lista</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {tipoLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 flex items-center justify-end gap-3">
            <button
              onClick={() => setConfirmType(null)}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                if (confirmType === "PREMIADOS") {
                  await handleExportPremiados();
                } else {
                  await handleExportParticipacion();
                }
                setConfirmType(null);
              }}
              disabled={loadingExport}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loadingExport ? "Exportando…" : "Exportar .xlsx"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* FILTROS */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Área */}
          <div className="relative">
            <select
              className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={filters.id_area ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  id_area:
                    e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              disabled={disable}
            >
              <option value="" disabled hidden>
                Filtrar por área
              </option>
              <option value={0}>Todas las áreas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {/* Nivel */}
          <div className="relative">
            <select
              className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={filters.id_nivel ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  id_nivel:
                    e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              disabled={disable}
            >
              <option value="" disabled hidden>
                Filtrar por nivel
              </option>
              <option value={0}>Todos los niveles</option>
              {niveles.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {/* Estado (placeholder) */}
          <div className="relative">
            <select
              className="h-11 w-full appearance-none rounded-lg border border-slate-100 bg-slate-50 px-3 pr-9 text-sm text-slate-400"
              disabled
              value=""
            >
              <option>Filtrar por Estado</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          </div>
        </div>
      </div>

      {/* GENERACIÓN DE CERTIFICADOS */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            Generación de Certificados
          </h2>
          <p className="text-sm text-slate-500">
            Exportar listas en formato Excel para certificados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD PREMIACIÓN */}
          <div className="border border-slate-100 rounded-xl bg-white py-7 px-4 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#E5F6EE] flex items-center justify-center text-[#0F9F4F] text-2xl">
              <FiFileText />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">
                Certificados de Premiación
              </h3>
              <p className="text-sm text-slate-500">
                Lista de ganadores de medallas y menciones
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmType("PREMIADOS")}
              disabled={disable}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>

          {/* CARD PARTICIPACIÓN */}
          <div className="border border-slate-100 rounded-xl bg-white py-7 px-4 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#E7F0FF] flex items-center justify-center text-[#0F62FE] text-2xl">
              <FiFileText />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">
                Certificados de Participación
              </h3>
              <p className="text-sm text-slate-500">
                Lista de todos los clasificados
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmType("PARTICIPACION")}
              disabled={disable}
              className="inline-flex items-center gap-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-4 py-2 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
