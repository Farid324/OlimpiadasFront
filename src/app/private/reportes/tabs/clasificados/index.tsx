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
