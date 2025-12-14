// src/app/private/reportes/tabs/publicacion/index.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { exportPublicacionExcel } from '@/components/reportes/publicacion.service';
import { api } from '@/libs/api';

type Filters = {
  id_area?: number | null;
  id_nivel?: number | null;
};

type AreaDTO = { id: number; nombre: string };
type NivelDTO = { id: number; nombre: string };

const STORAGE_KEY = 'reportes:publicacion:filters:v1';
const DEFAULT_FILTERS: Filters = { id_area: null, id_nivel: null };

const pick = (o: Record<string, unknown> | null | undefined, keys: string[]) =>
  keys.map(k => o?.[k]).find(v => v !== undefined && v !== null);

function mapCatalog<T extends { id: number; nombre: string }>(
  data: unknown,
  idKeys: string[],
  nameKeys: string[],
): T[] {
  const arr = (Array.isArray(data) ? data : []) as ReadonlyArray<Record<string, unknown>>;
  return arr
    .map(
      (r) =>
        ({
          id: Number(pick(r, idKeys)),
          nombre: String(pick(r, nameKeys) ?? '').trim(),
        } as T),
    )
    .filter((x): x is T => !Number.isNaN(x.id) && x.nombre.length > 0);
}

async function getAreas(): Promise<AreaDTO[]> {
  const { data } = await api.get('/areas');
  return mapCatalog<AreaDTO>(data, ['id_area', 'id', 'value'], ['nombre_area', 'nombre', 'label']);
}

async function getNiveles(): Promise<NivelDTO[]> {
  const { data } = await api.get('/niveles');
  return mapCatalog<NivelDTO>(data, ['id_nivel', 'id', 'value'], ['nombre_nivel', 'nombre', 'label']);
}

export default function PublicacionTab() {
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === 'undefined') return DEFAULT_FILTERS;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Filters;
    } catch {}
    return DEFAULT_FILTERS;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {}
  }, [filters]);

  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [niveles, setNiveles] = useState<NivelDTO[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

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

  const safeAreas = useMemo(
    () => (areas ?? []).filter((a): a is AreaDTO => !!a && typeof a.id === 'number' && !!a.nombre),
    [areas],
  );
  const safeNiveles = useMemo(
    () => (niveles ?? []).filter((n): n is NivelDTO => !!n && typeof n.id === 'number' && !!n.nombre),
    [niveles],
  );

  const [loadingExport, setLoadingExport] = useState(false);
  const handleExport = async () => {
    try {
      setLoadingExport(true);
      // 3. CAMBIO: Llama a TU función de exportación
      await exportPublicacionExcel({
        id_area: filters.id_area ?? undefined,
        id_nivel: filters.id_nivel ?? undefined,
      });
    } catch (err) {
      // 4. CAMBIO (Opcional): Mensaje de error correcto
      console.error('Error al generar la lista de publicación:', err);
      alert('No se pudo generar el Excel. Intenta nuevamente.');
    } finally {
      setLoadingExport(false);
    }
  };

  const areaPlaceholder = filters.id_area == null;
  const nivelPlaceholder = filters.id_nivel == null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Área */}
          <div className="relative">
            <select
              className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${
                areaPlaceholder ? 'text-gray-500' : 'text-black'
              }`}
              value={filters.id_area ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, id_area: e.target.value === '' ? null : Number(e.target.value) }))
              }
              aria-label="Filtrar por área"
              disabled={loadingCatalogs}
            >
              <option value="" disabled hidden style={{ color: '#6B7280' }}>
                Filtrar por área
              </option>
              <option value={0} style={{ color: '#111827' }}>
                Todas las áreas
              </option>
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
              className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 ${
                nivelPlaceholder ? 'text-gray-500' : 'text-black'
              }`}
              value={filters.id_nivel ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, id_nivel: e.target.value === '' ? null : Number(e.target.value) }))
              }
              aria-label="Filtrar por nivel"
              disabled={loadingCatalogs}
            >
              <option value="" disabled hidden style={{ color: '#6B7280' }}>
                Filtrar por nivel
              </option>
              <option value={0} style={{ color: '#111827' }}>
                Todos los niveles
              </option>
              {safeNiveles.map((n) => (
                <option key={`nivel-${n.id}`} value={n.id} style={{ color: '#111827' }}>
                  {n.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow">
        <header className="px-6 pt-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Formato para Publicacion</h2>
          <p className="text-gray-500 text-sm">
            Listas preparadas para publicar en la páginas oficial
          </p>
        </header>

        <div className="px-6">
          <hr className="mt-4 border-gray-200" />
        </div>

        <div className="p-6">
          <div className="border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-gray-50">
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileText className="w-10 h-10 text-[var(--rojoNaranja)]" strokeWidth={2.2} />
              <div className="text-sm font-semibold text-gray-800">Resultados Oficiales</div>
              <div className="text-sm text-gray-500">Formato optimizado para publicación web</div>

              <button
                onClick={handleExport}
                disabled={loadingExport}
                className="mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
              >
                {loadingExport ? 'Generando…' : 'Generar para Publicación'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
