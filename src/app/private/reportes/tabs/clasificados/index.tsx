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

const toParams = (filters?: ReportFilters) => {
  const p = new URLSearchParams();
  if (filters?.id_area && Number(filters.id_area) !== 0) p.set('id_area', String(filters.id_area));
  if (filters?.id_nivel && Number(filters.id_nivel) !== 0) p.set('id_nivel', String(filters.id_nivel));
  if (filters?.estado && filters.estado !== 'TODOS') p.set('estado', String(filters.estado));
  return Object.fromEntries(p);
};

async function getAreas(): Promise<AreaDTO[]> {
  const { data } = await api.get<any[]>('/areas');
  const arr = Array.isArray(data) ? data : [];
  return arr
    .map((a) => ({
      id: Number(a.id_area ?? a.id ?? a.value),
      nombre: String(a.nombre_area ?? a.nombre ?? a.label ?? '').trim(),
    }))
    .filter((x) => !Number.isNaN(x.id) && x.nombre.length > 0);
}

async function getNiveles(): Promise<NivelDTO[]> {
  const { data } = await api.get<any[]>('/niveles');
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
  const [filters, setFilters] = useState<ReportFilters>({
    id_area: null,
    id_nivel: null,
    estado: null,
  });

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

  const onExport = async () => {
    try {
      setLoadingExport(true);
      const blob = await exportClasificados(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clasificados.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setLoadingExport(false);
    }
  };

  const safeAreas   = useMemo(() => (areas ?? []).filter((a): a is AreaDTO => !!a && typeof a.id === 'number' && !!a.nombre), [areas]);
  const safeNiveles = useMemo(() => (niveles ?? []).filter((n): n is NivelDTO => !!n && typeof n.id === 'number' && !!n.nombre), [niveles]);

  const areaPlaceholder   = filters.id_area == null;
  const nivelPlaceholder  = filters.id_nivel == null;
  const estadoPlaceholder = filters.estado == null;

  return (
    <>
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
              {/* Placeholder (gris), oculto en el menú */}
              <option value="" disabled hidden style={{ color: '#6B7280' }}>Filtrar por área</option>
              {/* Opciones reales: SIEMPRE negras */}
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
