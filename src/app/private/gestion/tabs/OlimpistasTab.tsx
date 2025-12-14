'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, ChevronDown, Filter, Loader2, Search, CalendarDays, Award } from 'lucide-react';
import { fetchGestionesCerradas, type GestionCerrada } from '@/libs/gestiones.api';
import {
  fetchOlimpistasAreasByGestion,
  fetchOlimpistasClasificadosByGestion,
  fetchOlimpistasFinalistasByGestion,
} from '@/libs/olimpistas.api';

type OlimpistaHistRow = {
  id: number;
  nombreCompleto: string;
  area: string;
  nivel: string;
  puntuacion: number | null;
  unidadEducativa: string;
  departamento: string;
  // por si el back lo manda (no rompe si no viene)
  posicion?: number | null;
  medalla?: 'ORO' | 'PLATA' | 'BRONCE' | 'MENCION' | null;
};

type TabKey = 'CLASIFICADOS' | 'FINALISTAS';

function prettyMedalla(m?: OlimpistaHistRow['medalla']) {
  if (!m) return null;
  const up = String(m).toUpperCase();
  if (up === 'ORO') return 'Medalla de Oro';
  if (up === 'PLATA') return 'Medalla de Plata';
  if (up === 'BRONCE') return 'Medalla de Bronce';
  return 'Mención';
}

function MedalPill({ medalla }: { medalla?: OlimpistaHistRow['medalla'] }) {
  const label = prettyMedalla(medalla);
  if (!label) return <span className="text-gray-400">-</span>;

  const up = String(medalla).toUpperCase();

  const styles =
    up === 'ORO'
      ? { wrap: 'bg-amber-50 border-amber-200 text-amber-900', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-900' }
      : up === 'PLATA'
      ? { wrap: 'bg-slate-50 border-slate-200 text-slate-900', icon: 'text-slate-500', badge: 'bg-slate-100 text-slate-800' }
      : up === 'BRONCE'
      ? { wrap: 'bg-orange-50 border-orange-200 text-orange-900', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-900' }
      : { wrap: 'bg-sky-50 border-sky-200 text-sky-900', icon: 'text-sky-600', badge: 'bg-sky-100 text-sky-900' };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${styles.wrap} shadow-sm`}
      title={label}
    >
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${styles.badge}`}>
        <Award className={`w-4 h-4 ${styles.icon}`} />
      </span>

      <span className="text-[12px] font-semibold leading-none">{label}</span>
    </span>
  );
}

export default function OlimpistasTab() {
  const [gestiones, setGestiones] = useState<GestionCerrada[]>([]);
  const [selectedGestionId, setSelectedGestionId] = useState<number | null>(null);

  const [areasDisponibles, setAreasDisponibles] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('Todas');
  const [search, setSearch] = useState<string>('');

  const [activeTab, setActiveTab] = useState<TabKey>('CLASIFICADOS');

  const [dataByTab, setDataByTab] = useState<Record<TabKey, OlimpistaHistRow[]>>({
    CLASIFICADOS: [],
    FINALISTAS: [],
  });

  const [loadingByTab, setLoadingByTab] = useState<Record<TabKey, boolean>>({
    CLASIFICADOS: false,
    FINALISTAS: false,
  });

  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reqIdRef = useRef(0);

  // =========================
  // Cargar gestiones cerradas
  // =========================
  useEffect(() => {
    const loadGestiones = async () => {
      setLoadingInit(true);
      setError(null);
      try {
        const data = await fetchGestionesCerradas();
        setGestiones(data);
        setSelectedGestionId(data[0]?.id_gestion ?? null);
      } catch (e) {
        console.error(e);
        setError('No se pudo cargar el historial de gestiones.');
      } finally {
        setLoadingInit(false);
      }
    };
    loadGestiones();
  }, []);

  // =========================
  // Cargar áreas por gestión
  // =========================
  useEffect(() => {
    if (!selectedGestionId) return;

    fetchOlimpistasAreasByGestion(selectedGestionId)
      .then((a) => setAreasDisponibles(a ?? []))
      .catch(() => setAreasDisponibles([]));
  }, [selectedGestionId]);

  // =========================
  // Params (área + búsqueda)
  // =========================
  const params = useMemo(() => {
    return {
      area: selectedArea === 'Todas' ? undefined : selectedArea,
      q: search.trim() ? search.trim() : undefined,
    };
  }, [selectedArea, search]);

  // =========================
  // Prefetch BOTH tabs
  // =========================
  const prefetchBoth = async () => {
    if (!selectedGestionId) {
      setDataByTab({ CLASIFICADOS: [], FINALISTAS: [] });
      return;
    }

    const myReqId = ++reqIdRef.current;

    setError(null);
    setLoadingByTab({ CLASIFICADOS: true, FINALISTAS: true });

    try {
      const [clas, fin] = await Promise.all([
        fetchOlimpistasClasificadosByGestion(selectedGestionId, params),
        fetchOlimpistasFinalistasByGestion(selectedGestionId, params),
      ]);

      if (myReqId !== reqIdRef.current) return;

      setDataByTab({
        CLASIFICADOS: (clas as OlimpistaHistRow[]) ?? [],
        FINALISTAS: (fin as OlimpistaHistRow[]) ?? [],
      });
    } catch (e) {
      console.error(e);
      if (myReqId !== reqIdRef.current) return;

      setDataByTab({ CLASIFICADOS: [], FINALISTAS: [] });
      setError('No se pudo cargar el historial de olimpistas.');
    } finally {
      if (myReqId !== reqIdRef.current) return;
      setLoadingByTab({ CLASIFICADOS: false, FINALISTAS: false });
    }
  };

  // cuando cambia gestión o área -> prefetch inmediato
  useEffect(() => {
    setDataByTab({ CLASIFICADOS: [], FINALISTAS: [] });
    setLoadingByTab({ CLASIFICADOS: false, FINALISTAS: false });

    if (!selectedGestionId) return;
    prefetchBoth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGestionId, selectedArea]);

  // búsqueda con debounce -> prefetch ambos
  useEffect(() => {
    if (!selectedGestionId) return;
    const t = setTimeout(() => prefetchBoth(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  const gestionLabel = useMemo(() => {
    const g = gestiones.find((x) => x.id_gestion === selectedGestionId);
    if (!g) return '';
    return g.nombre ? `Gestión ${g.anio} – ${g.nombre}` : `Gestión ${g.anio}`;
  }, [gestiones, selectedGestionId]);

  const rowsToShow = dataByTab[activeTab];
  const loadingRows = loadingByTab[activeTab];

  if (!loadingInit && gestiones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Archive className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin historial de gestiones</h3>
        <p className="text-gray-500 max-w-md">El historial aparecerá cuando se cierre una gestión.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header + filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <div>
          <h3 className="text-gray-900 font-bold text-lg">Historial de Olimpistas</h3>
          <p className="text-gray-500 text-sm">Clasificados y finalistas de gestiones cerradas</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Gestión */}
          <div className="relative min-w-[260px] w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedGestionId ?? ''}
              onChange={(e) => setSelectedGestionId(Number(e.target.value))}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm w-full"
            >
              {gestiones.map((g) => (
                <option key={g.id_gestion} value={g.id_gestion}>
                  {g.nombre ? `Gestión ${g.anio} – ${g.nombre}` : `Gestión ${g.anio}`}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Área */}
          <div className="relative min-w-[190px] w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm w-full"
            >
              <option value="Todas">Todas las áreas</option>
              {areasDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative min-w-[260px] w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar (nombre, colegio, depto, CI...)"
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm w-full"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button onClick={prefetchBoth} className="ml-2 underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Pill de gestión + línea separadora (como en Áreas) */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-sm shrink-0">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm font-semibold">{gestionLabel || 'Gestión seleccionada'}</span>
          </div>

          <div className="flex-1 h-px bg-gray-200/80" />
        </div>


        {/* Tabs */}
        <div className="flex md:justify-start overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-full shadow-inner whitespace-nowrap">
            <button
              onClick={() => setActiveTab('CLASIFICADOS')}
              className={`flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'CLASIFICADOS'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <span>Clasificados</span>
            </button>

            <button
              onClick={() => setActiveTab('FINALISTAS')}
              className={`flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'FINALISTAS'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <span>Finalistas</span>
            </button>
          </div>
        </div>

        {/* Contenido */}
        {loadingInit || loadingRows ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span>Cargando...</span>
          </div>
        ) : rowsToShow.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">No hay datos para el filtro seleccionado.</p>
            {!!gestionLabel && <p className="text-xs text-gray-400 mt-2">{gestionLabel}</p>}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header de la tarjeta (sin botones extra) */}
            <div className="px-5 pt-5 pb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                {activeTab === 'CLASIFICADOS' ? 'Lista de Clasificados' : 'Lista de Finalistas'} ({rowsToShow.length})
              </h4>
              <p className="text-sm text-gray-500">
                {activeTab === 'CLASIFICADOS'
                  ? 'Olimpistas que pasaron a la ronda final'
                  : 'Olimpistas que participaron en la fase final'}
              </p>
            </div>

            {/* Tabla compacta (como tu referencia) */}
            <div className="px-5 pb-5">
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-[980px] w-full text-sm border-collapse">
                  <thead className="bg-white">
                    <tr className="text-gray-800 border-b border-black/80">
                      <th className="py-3 px-3 text-left font-semibold w-[110px]">Posición</th>
                      <th className="py-3 px-3 text-left font-semibold w-[260px]">Nombre</th>
                      <th className="py-3 px-3 text-left font-semibold w-[160px]">Área</th>
                      <th className="py-3 px-3 text-left font-semibold w-[170px]">Nivel</th>
                      <th className="py-3 px-3 text-center font-semibold w-[130px]">Puntuación</th>
                      <th className="py-3 px-3 text-left font-semibold w-[240px]">Unidad Educativa</th>
                      <th className="py-3 px-3 text-left font-semibold w-[170px]">Departamento</th>
                      {activeTab === 'FINALISTAS' && (
                        <th className="py-3 px-3 text-left font-semibold w-[170px]">Premio</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {rowsToShow.map((o, idx) => (
                      <tr key={o.id} className="border-b border-gray-200 last:border-b-0">
                        {/* Posición */}
                        <td className="py-4 px-3 text-gray-800 tabular-nums">
                          <span className="text-gray-400 mr-1">#</span>
                          {o.posicion ?? idx + 1}
                        </td>

                        {/* Nombre */}
                        <td className="py-4 px-3 text-gray-900 font-medium">
                          <div className="max-w-[240px] whitespace-normal leading-5">{o.nombreCompleto}</div>
                        </td>

                        {/* Área */}
                        <td className="py-4 px-3">
                          <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-900 text-xs font-semibold">
                            {o.area}
                          </span>
                        </td>

                        {/* Nivel */}
                        <td className="py-4 px-3">
                          <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-900 text-xs font-semibold">
                            {o.nivel}
                          </span>
                        </td>

                        {/* Puntuación */}
                        <td className="py-4 px-3 text-center text-gray-900 tabular-nums">
                          {o.puntuacion ?? '-'}
                        </td>

                        {/* Unidad Educativa */}
                        <td className="py-4 px-3 text-gray-900">
                          <div className="max-w-[230px] whitespace-normal leading-5">{o.unidadEducativa || '-'}</div>
                        </td>

                        {/* Departamento */}
                        <td className="py-4 px-3 text-gray-900">{o.departamento || '-'}</td>

                        {/* Premio */}
                        {activeTab === 'FINALISTAS' && (
                          <td className="py-4 px-3">
                            <MedalPill medalla={o.medalla ?? null} />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
