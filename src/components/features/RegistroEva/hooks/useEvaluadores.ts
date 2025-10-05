'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import type { Evaluador, Metrics } from '../types';

export default function useEvaluadores() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([]);

  async function load(query?: string) {
    setLoading(true);
    try {
      const { data } = await api.get<Evaluador[]>('/evaluadores', {
        params: query ? { q: query } : undefined,
      });
      setEvaluadores(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(q.trim() || undefined), 300);
    return () => clearTimeout(t);
  }, [q]);

  const metrics: Metrics = useMemo(() => {
    const total = evaluadores.length;
    const setAreas = new Set<number>();
    let sumExp = 0;

    for (const e of evaluadores) {
      e.evaluadores_area?.forEach((ea) => setAreas.add(ea.area.id_area));
      sumExp += e.experiencia ?? 0;
    }

    const areasCubiertas = setAreas.size;
    const promExp = total ? Math.round(sumExp / total) : 0;


    // NUEVO: conteo de evaluadores activos
    const activos = evaluadores.filter((e) => !!e.activo).length;

    return { total, activos, areasCubiertas, promExp };
  }, [evaluadores]);

  const refetch = () => load(q.trim() || undefined);

  return { q, setQ, loading, evaluadores, metrics, refetch };
}
