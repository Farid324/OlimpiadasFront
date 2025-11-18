// src/components/reportes/CeremoniaExportModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  exportCeremoniaExcel,
  getCeremoniaResumen,
  getCeremoniaLista,
  type CeremoniaResumen,
} from '@/components/reportes/ceremonia.service';

type Filters = {
  id_area?: number | null;
  id_nivel?: number | null;
  anio?: number | null;
  q?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  areaNombre: string;
  nivelNombre: string;
};

export default function CeremoniaExportModal({
  open,
  onClose,
  filters,
  areaNombre,
  nivelNombre,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState<CeremoniaResumen | null>(null);
  const [registros, setRegistros] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);

  // ===================== Cargar resumen + registros =====================
  useEffect(() => {
    if (!open) return;

    let cancel = false;

    (async () => {
      try {
        setLoading(true);

        const [r, list] = await Promise.all([
          getCeremoniaResumen({
            id_area: filters.id_area ?? undefined,
            id_nivel: filters.id_nivel ?? undefined,
            anio: filters.anio ?? undefined,
            q: filters.q ?? undefined,
          }),

          getCeremoniaLista({
            id_area: filters.id_area ?? undefined,
            id_nivel: filters.id_nivel ?? undefined,
            anio: filters.anio ?? undefined,
            q: filters.q ?? undefined,
          }),
        ]);

        if (!cancel) {
          setResumen(r);
          setRegistros(Array.isArray(list) ? list.length : 0);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [open, filters]);

  // ===================== Exportar =====================
  const handleExport = async () => {
    try {
      setDownloading(true);
      await exportCeremoniaExcel({
        id_area: filters.id_area ?? undefined,
        id_nivel: filters.id_nivel ?? undefined,
        anio: filters.anio ?? undefined,
        q: filters.q ?? undefined,
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert('No se pudo exportar el Excel. Intenta nuevamente.');
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  // ===================== Modal =====================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-3">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Exportar lista de premiados
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* SUBTÍTULO */}
        <p className="px-6 pt-3 text-sm text-gray-600">
          Lista filtrada para la <b className="text-gray-900">Ceremonia</b>
        </p>

        {/* CUERPO */}
        <div className="px-6 py-4">
          <div className="rounded-xl border bg-gray-50 p-4">
            {loading ? (
              <div className="text-sm text-gray-500">Cargando resumen…</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-gray-900">

                {/* Fila 1 */}
                <Info label="Área" value={areaNombre} />
                <Info label="Nivel" value={nivelNombre} />

                {/* Fila 2 */}
                <Info
                  label="Año"
                  value={(filters.anio ?? new Date().getFullYear()).toString()}
                />
                <Info label="Registros" value={registros.toString()} />

                {/* Contadores */}
                <div className="sm:col-span-2 mt-2">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <CardCount label="Oro" value={resumen?.oro ?? 0} />
                    <CardCount label="Plata" value={resumen?.plata ?? 0} />
                    <CardCount label="Bronce" value={resumen?.bronce ?? 0} />
                    <CardCount label="Menciones" value={resumen?.mencion ?? 0} />
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleExport}
            disabled={loading || downloading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {downloading ? 'Exportando…' : 'Exportar .xlsx'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== COMPONENTES =====================

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function CardCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white px-4 py-3 text-center shadow-sm">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
