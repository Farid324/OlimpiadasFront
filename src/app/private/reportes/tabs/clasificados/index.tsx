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