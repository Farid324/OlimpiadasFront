// src/app/private/reportes/tabs/clasificados/index.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/libs/api';
import { Eye, Download, ChevronDown } from 'lucide-react';

type EstadoClasificado = 'CLASIFICADO' | 'NO_CLASIFICADO' | 'DESCALIFICADO' | 'TODOS';

type ClasificadoItemDTO = {
  id_inscripcion: number;
  posicion: number | null;
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

type AreaDTO = { id: number; nombre: string };
type NivelDTO = { id: number; nombre: string };

type RawAreaDTO = {
  id_area?: number | string;
  id?: number | string;
  value?: number | string;
  nombre_area?: string;
  nombre?: string;
  label?: string;
};

type RawNivelDTO = {
  id_nivel?: number | string;
  id?: number | string;
  value?: number | string;
  nombre_nivel?: string;
  nombre?: string;
  label?: string;
};

/* ===================== PERSISTENCIA LOCAL ===================== */
const STORAGE_KEY = 'reportes:clasificados:filters:v1';
const DEFAULT_FILTERS: ReportFilters = { id_area: null, id_nivel: null, estado: null };

function readFiltersFromUrl(): ReportFilters {
  if (typeof window === 'undefined') return DEFAULT_FILTERS;
  const sp = new URLSearchParams(window.location.search);
  const id_area = sp.get('id_area');
  const id_nivel = sp.get('id_nivel');
  const estado = sp.get('estado') as EstadoClasificado | null;

  return {
    id_area: id_area !== null ? Number(id_area) : null,
    id_nivel: id_nivel !== null ? Number(id_nivel) : null,
    estado: estado || null,
  };
}

function toParams(filters?: ReportFilters) {
  const p = new URLSearchParams();
  if (filters?.id_area && Number(filters.id_area) !== 0) p.set('id_area', String(filters.id_area));
  if (filters?.id_nivel && Number(filters.id_nivel) !== 0) p.set('id_nivel', String(filters.id_nivel));
  if (filters?.estado && filters.estado !== 'TODOS') p.set('estado', String(filters.estado));
  return Object.fromEntries(p);
}

async function getAreas(): Promise<AreaDTO[]> {
  const { data } = await api.get<RawAreaDTO[]>('/areas');
  const arr = Array.isArray(data) ? data : [];
  return arr
    .map((a) => ({
      id: Number(a.id_area ?? a.id ?? a.value),
      nombre: String(a.nombre_area ?? a.nombre ?? a.label ?? '').trim(),
    }))
    .filter((x) => !Number.isNaN(x.id) && x.nombre.length > 0);
}

async function getNiveles(): Promise<NivelDTO[]> {
  const { data } = await api.get<RawNivelDTO[]>('/niveles');
  const arr = Array.isArray(data) ? data : [];
  return arr
    .map((n) => ({
      id: Number(n.id_nivel ?? n.id ?? n.value),
      nombre: String(n.nombre_nivel ?? n.nombre ?? n.label ?? '').trim(),
    }))
    .filter((x) => !Number.isNaN(x.id) && x.nombre.length > 0);
}

async function getListaClasificados(filters?: ReportFilters): Promise<ClasificadoItemDTO[]> {
  const { data } = await api.get<ClasificadoItemDTO[]>('/reportes/clasificados', { params: toParams(filters) });
  return data;
}

async function exportClasificados(filters?: ReportFilters): Promise<Blob> {
  const res = await api.get('/reportes/clasificados/export', { params: toParams(filters), responseType: 'blob' });
  return res.data as Blob;
}

export default function ClasificadosTab() {
  /* ====== Filtros: leer de sessionStorage/URL y persistirlos ====== */
  const [filters, setFilters] = useState<ReportFilters>(() => {
    if (typeof window === 'undefined') return DEFAULT_FILTERS;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ReportFilters;
    } catch {}
    // Si no hay en storage, intenta hidratar desde la URL
    return readFiltersFromUrl();
  });

  // Persistir cada cambio + reflejar en la URL (sin recargar)
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      const sp = new URLSearchParams(window.location.search);
      if (filters.id_area == null || Number(filters.id_area) === 0) sp.delete('id_area');
      else sp.set('id_area', String(filters.id_area));

      if (filters.id_nivel == null || Number(filters.id_nivel) === 0) sp.delete('id_nivel');
      else sp.set('id_nivel', String(filters.id_nivel));

      if (!filters.estado || filters.estado === 'TODOS') sp.delete('estado');
      else sp.set('estado', String(filters.estado));

      const q = sp.toString();
      const newUrl = q ? `${window.location.pathname}?${q}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } catch {}
  }, [filters]);

  /* ====== Estado de catálogos/filas ====== */
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [niveles, setNiveles] = useState<NivelDTO[]>([]);
  const [rows, setRows] = useState<ClasificadoItemDTO[]>([]);

  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

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

  const fetchRows = async (f: ReportFilters) => {
    setLoadingRows(true);
    try {
      const data = await getListaClasificados(f);
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    fetchRows(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.id_area, filters.id_nivel, filters.estado]);

  const safeAreas   = useMemo(() => (areas ?? []).filter((a): a is AreaDTO => !!a && typeof a.id === 'number' && !!a.nombre), [areas]);
  const safeNiveles = useMemo(() => (niveles ?? []).filter((n): n is NivelDTO => !!n && typeof n.id === 'number' && !!n.nombre), [niveles]);

  const getAreaLabel = () => {
    if (filters.id_area == null) return '—';
    if (filters.id_area === 0) return 'Todas las áreas';
    return safeAreas.find(a => a.id === filters.id_area)?.nombre ?? String(filters.id_area);
  };
  const getNivelLabel = () => {
    if (filters.id_nivel == null) return '—';
    if (filters.id_nivel === 0) return 'Todos los niveles';
    return safeNiveles.find(n => n.id === filters.id_nivel)?.nombre ?? String(filters.id_nivel);
  };
  const getEstadoLabel = () => {
    if (filters.estado == null) return '—';
    if (filters.estado === 'TODOS') return 'Todos los Estados';
    if (filters.estado === 'CLASIFICADO') return 'Clasificado';
    if (filters.estado === 'NO_CLASIFICADO') return 'No clasificado';
    if (filters.estado === 'DESCALIFICADO') return 'Descalificado';
    return String(filters.estado);
  };

  const onExport = async () => {
    if (rows.length === 0) {
      alert('No hay registros para exportar con los filtros actuales.');
      return;
    }

    const msg =
`Vas a exportar la lista con los siguientes filtros:

• Área: ${getAreaLabel()}
• Nivel: ${getNivelLabel()}
• Estado: ${getEstadoLabel()}

¿Deseas continuar?`;

    const ok = window.confirm(msg);
    if (!ok) return;

    try {
      setLoadingExport(true);
      const blob = await exportClasificados(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clasificados.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('No se pudo exportar la lista. Intenta nuevamente.');
    } finally {
      setLoadingExport(false);
    }
  };

  const areaPlaceholder   = filters.id_area == null;
  const nivelPlaceholder  = filters.id_nivel == null;
  const estadoPlaceholder = filters.estado == null;

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
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  id_area: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
              aria-label="Filtrar por área"
              disabled={loadingCatalogs}
            >
              <option value="" disabled hidden style={{ color: '#6B7280' }}>Filtrar por área</option>
              <option value={0} style={{ color: '#111827' }}>Todas las áreas</option>
              {safeAreas.map((a) => (
                <option key={`area-${a.id}`} value={a.id} style={{ color: '#111827' }}>
                  {a.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Nivel */}
          <div className="relative">
            <select
              className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${nivelPlaceholder ? 'text-gray-500' : 'text-black'}`}
              value={filters.id_nivel ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  id_nivel: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
              aria-label="Filtrar por nivel"
              disabled={loadingCatalogs}
            >
              <option value="" disabled hidden style={{ color: '#6B7280' }}>Filtrar por nivel</option>
              <option value={0} style={{ color: '#111827' }}>Todos los niveles</option>
              {safeNiveles.map((n) => (
                <option key={`nivel-${n.id}`} value={n.id} style={{ color: '#111827' }}>
                  {n.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Estado */}
          <div className="relative">
            <select
              className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${estadoPlaceholder ? 'text-gray-500' : 'text-black'}`}
              value={filters.estado ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  estado: (e.target.value || null) as EstadoClasificado | null,
                }))
              }
              aria-label="Filtrar por estado"
              disabled={loadingCatalogs}
            >
              <option value="" disabled hidden style={{ color: '#6B7280' }}>Filtrar por Estado</option>
              <option value="TODOS" style={{ color: '#111827' }}>Todos los Estados</option>
              <option value="CLASIFICADO" style={{ color: '#111827' }}>Clasificado</option>
              <option value="NO_CLASIFICADO" style={{ color: '#111827' }}>No clasificado</option>
              <option value="DESCALIFICADO" style={{ color: '#111827' }}>Descalificado</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* TABLA + ACCIONES */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-700">Lista de Clasificados ({rows.length})</h2>
            <p className="text-sm text-gray-500">Olimpistas que pasaron a la ronda final</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Eye className="mr-2 w-4 h-4" />
              Vista Previa
            </Button>
            <Button
              onClick={onExport}
              disabled={loadingRows || loadingExport || rows.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
              title={rows.length === 0 ? 'No hay registros para exportar' : 'Exportar lista filtrada'}
            >
              <Download className="mr-2 w-4 h-4" />
              {loadingExport ? 'Exportando…' : 'Exportar Lista'}
            </Button>
          </div>
        </div>

        {loadingRows ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : rows.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center">No hay clasificados</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto overflow-x-auto" tabIndex={0}>
            <table className="min-w-[1100px] border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10 border-b border-black">
                <tr className="text-gray-700">
                  <th className="py-3 px-4 text-left font-semibold w-24">Posición</th>
                  <th className="py-3 px-4 text-left font-semibold">Nombre</th>
                  <th className="py-3 px-4 text-left font-semibold">Área</th>
                  <th className="py-3 px-4 text-left font-semibold">Nivel</th>
                  <th className="py-3 px-4 text-left font-semibold">Puntuación</th>
                  <th className="py-3 px-4 text-left font-semibold">Unidad Educativa</th>
                  <th className="py-3 px-4 text-left font-semibold">Departamento</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_inscripcion} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-black tabular-nums">
                      <span className="text-gray-500 mr-1">#</span>{r.posicion ?? '-'}
                    </td>
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
    </div>
  );
}
