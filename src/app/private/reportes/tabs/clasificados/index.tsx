'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/libs/api';
import { Download, ChevronDown } from 'lucide-react';

/* ===================== Tipos ===================== */
type EstadoClasificado = 'CLASIFICADO' | 'NO_CLASIFICADO' | 'DESCALIFICADO' | 'TODOS';

type ClasificadoItemDTO = {
  id_inscripcion: number;
  posicion: number | null;
  // si el BE expone CI, esto ya queda listo; si no, no rompe
  ci?: string | null;
  nombreCompleto: string;
  area: string;
  nivel: string;
  puntaje: number;
  unidadEducativa: string;
  departamento: string;
};

type ReportFilters = {
  id_area?: number | null;
  id_nivel?: number | null;
  estado?: EstadoClasificado | null;
};

type AreaDTO  = { id: number; nombre: string };
type NivelDTO = { id: number; nombre: string };

/* ===================== Helpers reutilizables ===================== */
const STORAGE_KEY = 'reportes:clasificados:filters:v1';
const DEFAULT_FILTERS: ReportFilters = { id_area: null, id_nivel: null, estado: null };

const NIVEL_ORDER: Record<string, number> = { Secundaria: 0, Primaria: 1 };

const pick = (o: any, keys: string[]) =>
  keys.map(k => o?.[k]).find(v => v !== undefined && v !== null);

function mapCatalog<T extends { id: number; nombre: string }>(
  data: unknown,
  idKeys: string[],
  nameKeys: string[],
): T[] {
  const arr = Array.isArray(data) ? data : [];
  return arr
    .map((r: any) =>
      ({
        id: Number(pick(r, idKeys)),
        nombre: String(pick(r, nameKeys) ?? '').trim(),
      } as T),
    )
    .filter((x): x is T => !Number.isNaN(x.id) && x.nombre.length > 0);
}

function readFiltersFromUrl(): ReportFilters {
  if (typeof window === 'undefined') return DEFAULT_FILTERS;
  const sp = new URLSearchParams(window.location.search);
  const ia = sp.get('id_area');
  const inv = sp.get('id_nivel');
  const est = sp.get('estado') as EstadoClasificado | null;
  return {
    id_area: ia !== null ? Number(ia) : null,
    id_nivel: inv !== null ? Number(inv) : null,
    estado: est || null,
  };
}

const toParams = (filters?: ReportFilters) => {
  const p = new URLSearchParams();
  if (filters?.id_area  && Number(filters.id_area)  !== 0) p.set('id_area',  String(filters.id_area));
  if (filters?.id_nivel && Number(filters.id_nivel) !== 0) p.set('id_nivel', String(filters.id_nivel));
  if (filters?.estado  && filters.estado !== 'TODOS')     p.set('estado',   String(filters.estado));
  return Object.fromEntries(p);
};

const cmpStr = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' });

/** Ordena por Área -> Nivel (Secundaria, Primaria) -> Posición (asc/desc) */
function sortRows(rows: ClasificadoItemDTO[], asc: boolean): ClasificadoItemDTO[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    const areaCmp = cmpStr(a.area ?? '', b.area ?? '');
    if (areaCmp !== 0) return areaCmp;

    const na = NIVEL_ORDER[a.nivel] ?? 99;
    const nb = NIVEL_ORDER[b.nivel] ?? 99;
    if (na !== nb) return na - nb;

    const pa = a.posicion ?? Number.POSITIVE_INFINITY;
    const pb = b.posicion ?? Number.POSITIVE_INFINITY;
    return asc ? pa - pb : pb - pa;
  });
  return copy;
}

/* ===================== API ===================== */
async function getAreas(): Promise<AreaDTO[]> {
  const { data } = await api.get('/areas');
  return mapCatalog<AreaDTO>(data, ['id_area', 'id', 'value'], ['nombre_area', 'nombre', 'label']);
}

async function getNiveles(): Promise<NivelDTO[]> {
  const { data } = await api.get('/niveles');
  return mapCatalog<NivelDTO>(data, ['id_nivel', 'id', 'value'], ['nombre_nivel', 'nombre', 'label']);
}

async function getListaClasificados(filters?: ReportFilters): Promise<ClasificadoItemDTO[]> {
  const { data } = await api.get<ClasificadoItemDTO[]>('/reportes/clasificados', { params: toParams(filters) });
  return data;
}

async function exportClasificados(filters?: ReportFilters): Promise<Blob> {
  const res = await api.get('/reportes/clasificados/export', { params: toParams(filters), responseType: 'blob' });
  return res.data as Blob;
}

/* ====== Icono de orden: dos flechas; activa arriba o abajo ====== */
function SortPosIconDual({
  asc,
  className,
}: {
  asc: boolean;
  className?: string;
}) {
  const active = '#1a73e8';
  const inactive = '#cbd5e1';
  const strokeW = 2;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      {/* Abajo (izquierda) */}
      <g stroke={asc ? inactive : active} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v14" />
        <path d="M4 16l3 3 3-3" />
      </g>
      {/* Arriba (derecha) */}
      <g stroke={asc ? active : inactive} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21V7" />
        <path d="M14 10l3-3 3 3" />
      </g>
    </svg>
  );
}

/* ===================== Componente ===================== */
export default function ClasificadosTab() {
  // Filtros
  const [filters, setFilters] = useState<ReportFilters>(() => {
    if (typeof window === 'undefined') return DEFAULT_FILTERS;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ReportFilters;
    } catch {}
    return readFiltersFromUrl();
  });

  // Persistencia en URL + sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));

      const sp = new URLSearchParams(window.location.search);
      const setOrDel = (k: string, v: any, delIf: boolean) =>
        delIf ? sp.delete(k) : sp.set(k, String(v));

      setOrDel('id_area',  filters.id_area,  filters.id_area == null || Number(filters.id_area) === 0);
      setOrDel('id_nivel', filters.id_nivel, filters.id_nivel == null || Number(filters.id_nivel) === 0);
      setOrDel('estado',   filters.estado,  !filters.estado || filters.estado === 'TODOS');

      const q = sp.toString();
      const newUrl = q ? `${window.location.pathname}?${q}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } catch {}
  }, [filters]);

  // Datos
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [niveles, setNiveles] = useState<NivelDTO[]>([]);
  const [rows, setRows] = useState<ClasificadoItemDTO[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [orderAsc, setOrderAsc] = useState<boolean>(true);

  // Modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoadingCatalogs(true);
        const [a, n] = await Promise.all([getAreas(), getNiveles()]);
        if (!cancel) { setAreas(a); setNiveles(n); }
      } finally {
        if (!cancel) setLoadingCatalogs(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const fetchRows = async (f: ReportFilters) => {
    setLoadingRows(true);
    try {
      const data = await getListaClasificados(f);
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoadingRows(false); }
  };

  useEffect(() => {
    fetchRows(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.id_area, filters.id_nivel, filters.estado]);

  const safeAreas   = useMemo(() => (areas ?? []).filter((a): a is AreaDTO => !!a && typeof a.id === 'number' && !!a.nombre), [areas]);
  const safeNiveles = useMemo(() => (niveles ?? []).filter((n): n is NivelDTO => !!n && typeof n.id === 'number' && !!n.nombre), [niveles]);

  const sortedRows = useMemo(() => sortRows(rows, orderAsc), [rows, orderAsc]);

  // Labels
  const getAreaLabel = () =>
    filters.id_area == null ? '—' : filters.id_area === 0 ? 'Todas las áreas' :
    (safeAreas.find(a => a.id === filters.id_area)?.nombre ?? String(filters.id_area));
  const getNivelLabel = () =>
    filters.id_nivel == null ? '—' : filters.id_nivel === 0 ? 'Todos los niveles' :
    (safeNiveles.find(n => n.id === filters.id_nivel)?.nombre ?? String(filters.id_nivel));
  const getEstadoLabel = () =>
    filters.estado == null ? '—'
      : filters.estado === 'TODOS' ? 'Todos los Estados'
      : filters.estado === 'CLASIFICADO' ? 'Clasificados'
      : filters.estado === 'NO_CLASIFICADO' ? 'No clasificados'
      : filters.estado === 'DESCALIFICADO' ? 'Descalificados'
      : String(filters.estado);

  // Export (confirm modal flow)
  const doExport = async () => {
    try {
      setLoadingExport(true);
      const blob = await exportClasificados(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'clasificados.xlsx'; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('No se pudo exportar la lista. Intenta nuevamente.');
    } finally {
      setLoadingExport(false);
      setConfirmOpen(false);
    }
  };

  const areaPlaceholder   = filters.id_area  == null;
  const nivelPlaceholder  = filters.id_nivel == null;
  const estadoPlaceholder = filters.estado   == null;

  const total = sortedRows.length;
  const orderLabel = orderAsc ? 'Posición (ascendente)' : 'Posición (descendente)';

  /* ===================== UI ===================== */
  return (
    <div className="space-y-6">
      {/* FILTROS */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Área */}
          <div className="relative">
            <select
              className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${areaPlaceholder ? 'text-gray-500' : 'text-black'}`}
              value={filters.id_area ?? ''}
              onChange={(e) => setFilters(f => ({ ...f, id_area: e.target.value === '' ? null : Number(e.target.value) }))}
              aria-label="Filtrar por área"
              disabled={loadingCatalogs}
            >
              <option value="" disabled hidden style={{ color: '#6B7280' }}>Filtrar por área</option>
              <option value={0} style={{ color: '#111827' }}>Todas las áreas</option>
              {safeAreas.map(a => (
                <option key={`area-${a.id}`} value={a.id} style={{ color: '#111827' }}>{a.nombre}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Nivel */}
          <div className="relative">
            <select
              className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${nivelPlaceholder ? 'text-gray-500' : 'text-black'}`}
              value={filters.id_nivel ?? ''}
              onChange={(e) => setFilters(f => ({ ...f, id_nivel: e.target.value === '' ? null : Number(e.target.value) }))}
              aria-label="Filtrar por nivel"
              disabled={loadingCatalogs}
            >
              <option value="" disabled hidden style={{ color: '#6B7280' }}>Filtrar por nivel</option>
              <option value={0} style={{ color: '#111827' }}>Todos los niveles</option>
              {safeNiveles.map(n => (
                <option key={`nivel-${n.id}`} value={n.id} style={{ color: '#111827' }}>{n.nombre}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Estado */}
          <div className="relative">
            <select
              className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${estadoPlaceholder ? 'text-gray-500' : 'text-black'}`}
              value={filters.estado ?? ''}
              onChange={(e) => setFilters(f => ({ ...f, estado: (e.target.value || null) as EstadoClasificado | null }))}
              aria-label="Filtrar por estado"
              disabled={loadingCatalogs}
            >
              <option value="" disabled hidden style={{ color: '#6B7280' }}>Filtrar por Estado</option>
              <option value="TODOS" style={{ color: '#111827' }}>Todos los Estados</option>
              <option value="CLASIFICADO" style={{ color: '#111827' }}>Clasificados</option>
              <option value="NO_CLASIFICADO" style={{ color: '#111827' }}>No clasificados</option>
              <option value="DESCALIFICADO" style={{ color: '#111827' }}>Descalificados</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* TABLA + ACCIONES */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-700">Lista de Clasificados ({total})</h2>
            <p className="text-sm text-gray-500">Olimpistas que pasaron a la ronda final</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Ícono solo, sin hover/focus highlight */}
            <button
              type="button"
              onClick={() => setOrderAsc(v => !v)}
              aria-pressed={orderAsc}
              aria-label={orderAsc ? 'Ordenar posición descendente' : 'Ordenar posición ascendente'}
              title={orderAsc ? 'Posición ↓' : 'Posición ↑'}
              className="inline-flex items-center justify-center rounded-md p-2 cursor-pointer select-none focus:outline-none focus-visible:outline-none"
            >
              <SortPosIconDual asc={orderAsc} className="w-7 h-7" />
            </button>

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={loadingRows || loadingExport || total === 0}
              className="bg-blue-600 hover:bg-blue-700"
              title={total === 0 ? 'No hay registros para exportar' : 'Exportar lista filtrada'}
            >
              <Download className="mr-2 w-4 h-4" />
              {loadingExport ? 'Exportando…' : 'Exportar Lista'}
            </Button>
          </div>
        </div>

        {loadingRows ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : total === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center">No hay clasificados</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto overflow-x-auto" tabIndex={0}>
            <table className="min-w-[1100px] border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10 border-b border-black">
                <tr className="text-gray-700">
                  <th className="py-3 px-4 text-left font-semibold w-24">Posición</th>
                  {/* Si quieres mostrar CI también en la UI, descomenta esta columna
                  <th className="py-3 px-4 text-left font-semibold w-28">CI</th>
                  */}
                  <th className="py-3 px-4 text-left font-semibold">Nombre</th>
                  <th className="py-3 px-4 text-left font-semibold">Área</th>
                  <th className="py-3 px-4 text-left font-semibold">Nivel</th>
                  <th className="py-3 px-4 text-left font-semibold">Puntuación</th>
                  <th className="py-3 px-4 text-left font-semibold">Unidad Educativa</th>
                  <th className="py-3 px-4 text-left font-semibold">Departamento</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map(r => (
                  <tr key={r.id_inscripcion} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-black tabular-nums">
                      <span className="text-gray-500 mr-1">#</span>{r.posicion ?? '-'}
                    </td>
                    {/* <td className="py-3 px-4 text-black tabular-nums">{r.ci ?? '-'}</td> */}
                    <td className="py-3 px-4 text-black">{r.nombreCompleto}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-md bg-gray-200 text-black text-xs font-bold">{r.area}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-md bg-gray-200 text-black text-xs font-bold">{r.nivel}</span>
                    </td>
                    <td className="py-3 px-4 text-black tabular-nums text-center w-24">{r.puntaje}</td>
                    <td className="py-3 px-4 text-black">{r.unidadEducativa}</td>
                    <td className="py-3 px-4 text-black">{r.departamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =============== MODAL DE CONFIRMACIÓN =============== */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />

          {/* Card */}
          <div className="relative z-10 w-full max-w-lg rounded-xl overflow-hidden shadow-xl bg-white">
            <div className="bg-indigo-600 text-white px-4 py-3">
              <h3 className="font-semibold">Exportar lista de olimpistas</h3>
            </div>

            <div className="p-4 space-y-2 text-sm text-slate-700">
              <p className="text-slate-600">
                Se generará un archivo <strong>.xlsx</strong> con cabecera institucional y las columnas requeridas
                (incluyendo <strong>CI</strong> luego de <em>Posición</em>).
              </p>
              <ul className="mt-2 space-y-1">
                <li>• <strong>Área:</strong> {getAreaLabel()}</li>
                <li>• <strong>Nivel:</strong> {getNivelLabel()}</li>
                <li>• <strong>Estado:</strong> {getEstadoLabel()}</li>
                <li>• <strong>Orden:</strong> {orderLabel}</li>
                <li>• <strong>Registros:</strong> {total}</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                La primera fila del Excel incluirá <em>“Sistema de Registro y Evaluaciones Oh SanSi – 2025”</em> y la segunda
                fila el tipo de lista según el estado y la fecha de exportación.
              </p>
            </div>

            <div className="px-4 py-3 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={loadingExport || total === 0}
                onClick={doExport}
              >
                {loadingExport ? 'Exportando…' : 'Exportar .xlsx'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
