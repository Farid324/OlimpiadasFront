// src/app/private/reportes/tabs/premiados/index.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/libs/api";
import { Download, ChevronDown } from "lucide-react";
import { getPremiadosLista as getPremiadosListaSvc } from "@/components/reportes/service";

/* ===================== Tipos ===================== */
type EstadoPremio = "ORO" | "PLATA" | "BRONCE" | "MENCION" | "TODOS";

type PremiadoItemDTO = {
  id_inscripcion: number;
  posicion: number | null;
  nombreCompleto: string;
  premio: string;
  estadoPremio: "ORO" | "PLATA" | "BRONCE" | "MENCION";
  area: string;
  nivel: string;
  puntuacion: number;
  unidadEducativa: string;
  departamento: string;
};

type ReportFilters = {
  id_area?: number | null;
  id_nivel?: number | null;
  estado?: EstadoPremio | null;
};

type AreaDTO = { id: number; nombre: string };
type NivelDTO = { id: number; nombre: string };

/* ===================== Helpers reutilizables ===================== */
const STORAGE_KEY = "reportes:premiados:filters:v1";
const DEFAULT_FILTERS: ReportFilters = {
  id_area: null,
  id_nivel: null,
  estado: null,
};

const NIVEL_ORDER: Record<string, number> = { Secundaria: 0, Primaria: 1 };
const MEDAL_ORDER: Record<PremiadoItemDTO["estadoPremio"], number> = {
  ORO: 1,
  PLATA: 2,
  BRONCE: 3,
  MENCION: 4,
};

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
    .filter((x): x is T => !Number.isNaN(x.id) && x.nombre.length > 0);
}

function readFiltersFromUrl(): ReportFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  const sp = new URLSearchParams(window.location.search);
  const ia = sp.get("id_area");
  const inv = sp.get("id_nivel");
  const est = sp.get("estado") as EstadoPremio | null;
  return {
    id_area: ia !== null ? Number(ia) : null,
    id_nivel: inv !== null ? Number(inv) : null,
    estado: est || null,
  };
}

const toParams = (filters?: ReportFilters) => {
  const p = new URLSearchParams();
  if (filters?.id_area && Number(filters.id_area) !== 0)
    p.set("id_area", String(filters.id_area));
  if (filters?.id_nivel && Number(filters.id_nivel) !== 0)
    p.set("id_nivel", String(filters.id_nivel));
  if (filters?.estado && filters.estado !== "TODOS")
    p.set("estado", String(filters.estado));
  return Object.fromEntries(p);
};

const cmpStr = (a: string, b: string) =>
  a.localeCompare(b, "es", { sensitivity: "base" });

/** Ordena por Área -> Nivel (Secundaria, Primaria) -> Medalla -> Posición */
function sortRows(rows: PremiadoItemDTO[], asc: boolean): PremiadoItemDTO[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    const areaCmp = cmpStr(a.area ?? "", b.area ?? "");
    if (areaCmp !== 0) return areaCmp;

    const na = NIVEL_ORDER[a.nivel] ?? 99;
    const nb = NIVEL_ORDER[b.nivel] ?? 99;
    if (na !== nb) return na - nb;

    const ma = MEDAL_ORDER[a.estadoPremio] ?? 99;
    const mb = MEDAL_ORDER[b.estadoPremio] ?? 99;
    if (ma !== mb) return ma - mb;

    const pa = a.posicion ?? Number.POSITIVE_INFINITY;
    const pb = b.posicion ?? Number.POSITIVE_INFINITY;
    return asc ? pa - pb : pb - pa;
  });
  return copy;
}

/* ====== Icono de orden (tabla) ====== */
function SortPosIconDual({
  asc,
  className,
}: {
  asc: boolean;
  className?: string;
}) {
  const active = "#1a73e8";
  const inactive = "#cbd5e1";
  const strokeW = 2;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke={asc ? inactive : active}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 3v14" />
        <path d="M4 16l3 3 3-3" />
      </g>
      <g
        stroke={asc ? active : inactive}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21V7" />
        <path d="M14 10l3-3 3 3" />
      </g>
    </svg>
  );
}

/* ===================== API ===================== */
async function getAreas(): Promise<AreaDTO[]> {
  const { data } = await api.get("/areas");
  return mapCatalog<AreaDTO>(
    data,
    ["id_area", "id", "value"],
    ["nombre_area", "nombre", "label"]
  );
}

async function getNiveles(): Promise<NivelDTO[]> {
  const { data } = await api.get("/niveles");
  return mapCatalog<NivelDTO>(
    data,
    ["id_nivel", "id", "value"],
    ["nombre_nivel", "nombre", "label"]
  );
}

async function exportPremiados(filters?: ReportFilters): Promise<Blob> {
  const res = await api.get("/reportes/premiados/export", {
    params: toParams(filters),
    responseType: "blob",
  });
  return res.data as Blob;
}

/* ===================== Utilidades UI/Export ===================== */
function normalizeId(v: number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  if (n === 0) return null;
  return n;
}

function getNombreById(
  id: number | null,
  list: ReadonlyArray<{ id: number; nombre: string }>,
  fallbackAll: string
): string {
  if (!id) return fallbackAll;
  const found = list.find((x) => x.id === id);
  return found?.nombre ?? fallbackAll;
}

function safeFilenamePart(input: string): string {
  const s = (input ?? "").trim();
  if (!s) return "todos";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // sin tildes
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

/* ===================== Componente ===================== */
export default function PremiadosTab({
  disabled,
}: { disabled?: boolean } = {}) {
  // Filtros persistentes
  const [filters, setFilters] = useState<ReportFilters>(() => {
    if (typeof window === "undefined") return DEFAULT_FILTERS;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ReportFilters;
    } catch {}
    return readFiltersFromUrl();
  });

  // Catálogos y filas
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [niveles, setNiveles] = useState<NivelDTO[]>([]);
  const [rows, setRows] = useState<PremiadoItemDTO[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [orderAsc, setOrderAsc] = useState<boolean>(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Carga de catálogos
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoadingCatalogs(true);
        const [a, n] = await Promise.all([getAreas(), getNiveles()]);
        if (!cancel) {
          setAreas(a);
          setNiveles(n);
        }
      } finally {
        if (!cancel) setLoadingCatalogs(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const fetchRows = useCallback(
    async (f: ReportFilters) => {
      setLoadingRows(true);
      try {
        const data = await getListaPremiados(f);
        setRows(Array.isArray(data) ? data : []);
      } catch {
        setRows([]);
      } finally {
        setLoadingRows(false);
      }
    },
    [setLoadingRows, setRows]
  );

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    void fetchRows(filters);
  }, [filters, fetchRows]);

  const safeAreas = useMemo(
    () => areas.filter((a) => !!a && typeof a.id === "number"),
    [areas]
  );
  const safeNiveles = useMemo(
    () => niveles.filter((n) => !!n && typeof n.id === "number"),
    [niveles]
  );

  const filteredRows = useMemo(() => {
    if (!filters.estado || filters.estado === "TODOS") return rows;
    return rows.filter((r) => r.estadoPremio === filters.estado);
  }, [rows, filters.estado]);

  const sortedRows = useMemo(
    () => sortRows(filteredRows, orderAsc),
    [filteredRows, orderAsc]
  );

  const total = sortedRows.length;
  const orderLabel = orderAsc
    ? "Posición (ascendente)"
    : "Posición (descendente)";

  // Labels correctos para el resumen (Área/Nivel con NOMBRE)
  const selectedAreaId = useMemo(
    () => normalizeId(filters.id_area),
    [filters.id_area]
  );
  const selectedNivelId = useMemo(
    () => normalizeId(filters.id_nivel),
    [filters.id_nivel]
  );

  const resumenArea = useMemo(
    () => getNombreById(selectedAreaId, safeAreas, "Todas las áreas"),
    [selectedAreaId, safeAreas]
  );

  const resumenNivel = useMemo(
    () => getNombreById(selectedNivelId, safeNiveles, "Todos los niveles"),
    [selectedNivelId, safeNiveles]
  );

  const resumenEstado = useMemo(() => {
    const est = filters.estado ?? "TODOS";
    if (est === "TODOS") return "Todos";
    if (est === "ORO") return "Oro";
    if (est === "PLATA") return "Plata";
    if (est === "BRONCE") return "Bronce";
    return "Mención";
  }, [filters.estado]);

  /* ===== Exportar ===== */
  const doExport = async () => {
    try {
      setLoadingExport(true);
      const blob = await exportPremiados(filters);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const fileArea = safeFilenamePart(resumenArea);
      const fileNivel = safeFilenamePart(resumenNivel);
      const fileEstado = safeFilenamePart(resumenEstado);
      a.download = `premiados_${fileArea}_${fileNivel}_${fileEstado}.xlsx`;

      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al exportar lista:", e);
      alert("No se pudo exportar la lista.");
    } finally {
      setLoadingExport(false);
      setConfirmOpen(false);
    }
  };

  async function getListaPremiados(
    filters?: ReportFilters
  ): Promise<PremiadoItemDTO[]> {
    const res = await getPremiadosListaSvc({
      id_area: filters?.id_area ?? undefined,
      id_nivel: filters?.id_nivel ?? undefined,
      estado: filters?.estado ?? undefined,
    });
    if (!res.ok) {
      return [];
    }
    return res.data;
  }

  /* ===== UI ===== */
  return (
    <div
      className={disabled ? "opacity-50 pointer-events-none select-none" : ""}
    >
      <div className="space-y-6">
        {/* FILTROS */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Área */}
            <div className="relative">
              <select
                className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${
                  filters.id_area ? "text-black" : "text-gray-500"
                }`}
                value={filters.id_area ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    id_area:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                aria-label="Filtrar por área"
                disabled={loadingCatalogs}
              >
                <option value="" disabled hidden>
                  Filtrar por área
                </option>
                <option value={0} className="text-black">
                  Todas las áreas
                </option>
                {safeAreas.map((a) => (
                  <option
                    key={`area-${a.id}`}
                    value={a.id}
                    className="text-black"
                  >
                    {a.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            {/* Nivel */}
            <div className="relative">
              <select
                className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${
                  filters.id_nivel ? "text-black" : "text-gray-500"
                }`}
                value={filters.id_nivel ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    id_nivel:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                aria-label="Filtrar por nivel"
                disabled={loadingCatalogs}
              >
                <option value="" disabled hidden>
                  Filtrar por nivel
                </option>
                <option value={0} className="text-black">
                  Todos los niveles
                </option>
                {safeNiveles.map((n) => (
                  <option
                    key={`nivel-${n.id}`}
                    value={n.id}
                    className="text-black"
                  >
                    {n.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            {/* Estado */}
            <div className="relative">
              <select
                className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${
                  filters.estado ? "text-black" : "text-gray-500"
                }`}
                value={filters.estado ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    estado: (e.target.value || null) as EstadoPremio | null,
                  }))
                }
                aria-label="Filtrar por estado"
                disabled={loadingCatalogs}
              >
                <option value="" disabled hidden>
                  Filtrar por estado
                </option>
                <option value="TODOS" className="text-black">
                  Todos
                </option>
                <option value="ORO" className="text-black">
                  Oro
                </option>
                <option value="PLATA" className="text-black">
                  Plata
                </option>
                <option value="BRONCE" className="text-black">
                  Bronce
                </option>
                <option value="MENCION" className="text-black">
                  Mención
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* TABLA + ACCIONES */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-gray-700">
                Lista de Premiados ({total})
              </h2>
              <p className="text-sm text-gray-500">
                Competidores que recibieron medallas o menciones
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOrderAsc((v) => !v)}
                aria-pressed={orderAsc}
                aria-label={
                  orderAsc
                    ? "Ordenar posición descendente"
                    : "Ordenar posición ascendente"
                }
                title={orderAsc ? "Posición ↓" : "Posición ↑"}
                className="inline-flex items-center justify-center rounded-md p-2 cursor-pointer select-none focus:outline-none focus-visible:outline-none"
                data-testid="btn-sort-pos"
              >
                <SortPosIconDual asc={orderAsc} className="w-7 h-7" />
              </button>

              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={loadingRows || loadingExport || total === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-2 w-4 h-4" />
                {loadingExport ? "Exportando…" : "Exportar Lista"}
              </Button>
            </div>
          </div>

          {loadingRows ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : total === 0 ? (
            <div className="border rounded-md p-6 text-gray-500 text-center">
              No hay premiados
            </div>
          ) : (
            <div
              className="max-h-[500px] overflow-y-auto overflow-x-auto"
              tabIndex={0}
            >
              <table className="min-w-[1100px] border-collapse text-sm">
                <thead className="sticky top-0 bg-white z-10 border-b border-black">
                  <tr className="text-black">
                    <th className="py-3 px-4 text-left font-semibold w-24">
                      Posición
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Nombre
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Premio
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">Área</th>
                    <th className="py-3 px-4 text-left font-semibold">Nivel</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Puntuación
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Unidad Educativa
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Departamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((r) => (
                    <tr
                      key={r.id_inscripcion}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-black tabular-nums">
                        <span className="text-gray-500 mr-1">#</span>
                        {r.posicion ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-black">
                        {r.nombreCompleto}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-bold ${
                            r.estadoPremio === "ORO"
                              ? "bg-amber-100 text-amber-800"
                              : r.estadoPremio === "PLATA"
                              ? "bg-gray-200 text-gray-800"
                              : r.estadoPremio === "BRONCE"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {r.premio}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-black">{r.area}</td>
                      <td className="py-3 px-4 text-black">{r.nivel}</td>
                      <td className="py-3 px-4 text-center text-black">
                        {r.puntuacion !== null &&
                        r.puntuacion !== undefined &&
                        !Number.isNaN(Number(r.puntuacion))
                          ? Number(r.puntuacion).toFixed(1)
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-black">
                        {r.unidadEducativa}
                      </td>
                      <td className="py-3 px-4 text-black">{r.departamento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL EXPORTAR */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setConfirmOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-xl overflow-hidden shadow-xl bg-white">
              <div className="bg-white text-slate-800 px-4 py-3 shadow-md border-b border-slate-100">
                <h3 className="font-semibold">Exportar lista de premiados</h3>
              </div>

              <div className="p-4 text-sm text-slate-700 space-y-2">
                <p>
                  Se generará un archivo <strong>.xlsx</strong> con los
                  premiados según los filtros aplicados.
                </p>
                <ul className="space-y-1">
                  <li>
                    • <strong>Área:</strong> {resumenArea}
                  </li>
                  <li>
                    • <strong>Nivel:</strong> {resumenNivel}
                  </li>
                  <li>
                    • <strong>Estado:</strong> {resumenEstado}
                  </li>
                  <li>
                    • <strong>Orden:</strong> {orderLabel}
                  </li>
                  <li>
                    • <strong>Registros:</strong> {total}
                  </li>
                </ul>
              </div>

              <div className="px-4 py-3 bg-slate-50 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  disabled={loadingExport || total === 0}
                  onClick={doExport}
                >
                  {loadingExport ? "Exportando…" : "Exportar .xlsx"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
