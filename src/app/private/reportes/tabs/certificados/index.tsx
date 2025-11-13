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
  const [filters, setFilters] = useState<Filters>({
    id_area: null,
    id_nivel: null,
  });

  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [downPremiados, setDownPremiados] = useState(false);
  const [downParticipacion, setDownParticipacion] = useState(false);

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

  const handleExportPremiados = async () => {
    try {
      setDownPremiados(true);
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
      console.error("Error al exportar premiados:", e); // <-- Aquí la usas
      alert("No se pudo exportar los certificados de premiación.");
    } finally {
      setDownPremiados(false);
    }
  };

  const handleExportParticipacion = async () => {
    try {
      setDownParticipacion(true);
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
      console.error("Error al exportar participación:", e); // <-- Aquí la usas
      alert("No se pudo exportar los certificados de participación.");
    } finally {
      setDownParticipacion(false);
    }
  };

  const disable = loadingCatalogs;

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
              onClick={handleExportPremiados}
              disabled={disable || downPremiados}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              {downPremiados ? "Exportando…" : "Exportar Excel"}
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
              onClick={handleExportParticipacion}
              disabled={disable || downParticipacion}
              className="inline-flex items-center gap-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-4 py-2 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              {downParticipacion ? "Exportando…" : "Exportar Excel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
