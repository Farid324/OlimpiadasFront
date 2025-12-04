// src/components/features/RegistroEva/AssignOlimpistasModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, ChevronDown } from 'lucide-react';

type Area = { id_area: number; nombre_area: string };

type EvaluadorConAreas = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  evaluadores_area?: { area: Area }[];
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  evaluadores: EvaluadorConAreas[];
};

type Row = {
  id_usuario: number;
  nombreCompleto: string;
  initials: string;
  cupoClasificacion: string;
  cupoFinal: string;
};

type EstadoAsignacionRespuesta = {
  id_area: number;
  totalClasif: number;
  totalFinal: number;
  puedeEditarClasificatoria: boolean;
  puedeEditarFinal: boolean;
};

const buildInitials = (nombre?: string | null, apellido?: string | null) => {
  const n = (nombre || '').trim();
  const a = (apellido || '').trim();
  const first = (n && n[0]) || '';
  const second = (a && a[0]) || (n.split(' ')[1]?.[0] ?? '');
  const combined = `${first}${second}`.toUpperCase();
  return combined || 'EV';
};

export default function AssignOlimpistasModal({
  onClose,
  onSuccess,
  evaluadores,
}: Props) {
  const [selectedAreaId, setSelectedAreaId] = useState<number | ''>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'ok' | 'err' | null>(null);

  const [puedeClasif, setPuedeClasif] = useState(true);
  const [puedeFinal, setPuedeFinal] = useState(false);
  const [resumen, setResumen] = useState<{
    totalClasif: number;
    totalFinal: number;
  } | null>(null);

  const areaPlaceholder = selectedAreaId === '';

  /* ========================= ÁREAS ========================= */
  const areaOptions = useMemo<Area[]>(() => {
    const map = new Map<number, Area>();

    evaluadores.forEach((ev) => {
      ev.evaluadores_area?.forEach((ea) => {
        const a = ea.area;
        if (!map.has(a.id_area)) {
          map.set(a.id_area, a);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.nombre_area.localeCompare(b.nombre_area),
    );
  }, [evaluadores]);

  /* ========================= LOAD POR ÁREA ========================= */
  useEffect(() => {
    if (!selectedAreaId) {
      setRows([]);
      setPuedeClasif(true);
      setPuedeFinal(false);
      setResumen(null);
      return;
    }

    const evalsArea = evaluadores.filter((ev) =>
      ev.evaluadores_area?.some((ea) => ea.area.id_area === selectedAreaId),
    );

    const initRows: Row[] = evalsArea.map((e) => ({
      id_usuario: e.id_usuario,
      nombreCompleto: `${e.nombre} ${e.apellido}`,
      initials: buildInitials(e.nombre, e.apellido),
      cupoClasificacion: '',
      cupoFinal: '',
    }));

    setRows(initRows);

    (async () => {
      try {
        const { data } = await api.get<EstadoAsignacionRespuesta>(
          '/evaluadores/asignar-olimpistas/estado',
          { params: { id_area: selectedAreaId } },
        );

        setPuedeClasif(data.puedeEditarClasificatoria);
        setPuedeFinal(data.puedeEditarFinal);
        setResumen({
          totalClasif: data.totalClasif,
          totalFinal: data.totalFinal,
        });
      } catch {
        setPuedeClasif(true);
        setPuedeFinal(false);
        setResumen(null);
      }
    })();
  }, [evaluadores, selectedAreaId]);

  const updateRow = (
    id_usuario: number,
    field: 'cupoClasificacion' | 'cupoFinal',
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id_usuario === id_usuario ? { ...r, [field]: value } : r,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!selectedAreaId) {
      setMsgType('err');
      setMsg('Selecciona un área.');
      return;
    }

    if (!rows.length) {
      setMsgType('err');
      setMsg('No hay evaluadores para el área seleccionada.');
      return;
    }

    try {
      setLoading(true);
      setMsg(null);
      setMsgType(null);

      const asignaciones = rows.map((r) => ({
        id_usuario: r.id_usuario,
        cupo_clasificacion:
          r.cupoClasificacion.trim() === ''
            ? undefined
            : Number(r.cupoClasificacion),
        cupo_final:
          r.cupoFinal.trim() === '' ? undefined : Number(r.cupoFinal),
      }));

      await api.post('/evaluadores/asignar-olimpistas', {
        id_area: selectedAreaId,
        asignaciones,
      });

      setMsgType('ok');
      setMsg('Cupos asignados correctamente.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err: unknown) {
      // Tipar error provenientes de Axios u otros
      let backendMsg: unknown = 'No se pudo asignar los cupos. Revisa los valores.';

      if (typeof err === 'object' && err !== null) {
        const axiosErr = err as {
          response?: { data?: { message?: unknown } };
        };

        if (axiosErr.response?.data?.message !== undefined) {
          backendMsg = axiosErr.response.data.message;
        }
      }

      setMsgType('err');
      setMsg(
        Array.isArray(backendMsg)
          ? backendMsg.join(' / ')
          : String(backendMsg),
      );
    }finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Contenedor principal: ya no hace scroll; el scroll va en la tabla */}
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-2xl relative text-black shadow max-h-[90vh] flex flex-col overflow-hidden">
        {/* Botón X */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl leading-none"
          aria-label="Cerrar"
          type="button"
          disabled={loading}
        >
          ✕
        </button>

        {/* Encabezado */}
        <h2 className="text-2xl font-bold mb-1">
          Asignar olimpistas a evaluadores
        </h2>
        <p className="text-gray-500 text-sm mb-3">
          Selecciona un área y define cuántos olimpistas evaluará cada
          evaluador en la fase clasificatoria y luego en la fase final.
        </p>

        {/* Área + resumen */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Área
            </label>
            <div className="relative">
              <select
                value={selectedAreaId}
                onChange={(e) =>
                  setSelectedAreaId(
                    e.target.value ? Number(e.target.value) : '',
                  )
                }
                className={`h-11 w-full appearance-none rounded-md border px-3 pr-9 text-sm ${
                  areaPlaceholder
                    ? 'text-gray-500 bg-gray-50'
                    : 'text-black bg-white'
                } focus:outline-none focus:ring-0 focus:border-gray-300`}
              >
                <option value="" disabled hidden style={{ color: '#6B7280' }}>
                  Seleccione un Área
                </option>
                {areaOptions.map((a) => (
                  <option
                    key={a.id_area}
                    value={a.id_area}
                    style={{ color: '#111827' }}
                  >
                    {a.nombre_area}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {resumen && (
            <div className="flex-1 flex justify-start sm:justify-end">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400">
                    Inscritos
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-900 font-semibold">
                    {resumen.totalClasif}
                  </span>
                </div>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400">
                    Finalistas
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-900 font-semibold">
                    {resumen.totalFinal}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla – área scrollable */}
        <div className="mt-1 flex-1 min-h-0 overflow-y-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-white border-b border-black">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left font-semibold">Evaluador</th>
                <th className="py-3 px-4 text-left sm:text-center font-semibold">
                  Fase clasificatoria
                </th>
                <th className="py-3 px-4 text-left sm:text-center font-semibold">
                  Fase final
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id_usuario}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* CELDA EVALUADOR ALINEADA ARRIBA */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold text-sm">
                        {r.initials}
                      </div>
                      <span className="font-bold text-black break-normal">
                        {r.nombreCompleto}
                      </span>
                    </div>
                  </td>

                  {/* FASE CLASIFICATORIA ALINEADA ARRIBA */}
                  <td className="py-4 px-4 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        value={r.cupoClasificacion}
                        onChange={(e) =>
                          updateRow(
                            r.id_usuario,
                            'cupoClasificacion',
                            e.target.value,
                          )
                        }
                        className="w-24 text-center focus:ring-0 focus:border-gray-300"
                        disabled={!puedeClasif}
                      />
                      <div className="h-9 flex items-center justify-center">
                        {!puedeClasif && (
                          <p className="text-[10px] text-gray-400 text-center max-w-[230px]">
                            La fase final ya está en curso. Esta asignación
                            está bloqueada.
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* FASE FINAL ALINEADA ARRIBA */}
                  <td className="py-4 px-4 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        value={r.cupoFinal}
                        onChange={(e) =>
                          updateRow(
                            r.id_usuario,
                            'cupoFinal',
                            e.target.value,
                          )
                        }
                        className="w-24 text-center focus:ring-0 focus:border-gray-300"
                        disabled={!puedeFinal}
                      />
                      <div className="mt-1 h-9 flex items-center justify-center">
                        {!puedeFinal && (
                          <p className="text-[10px] text-gray-400 text-center max-w-[230px]">
                            Se habilitará cuando existan olimpistas
                            clasificados a la fase final en esta área.
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-5 text-center text-gray-400 text-sm"
                  >
                    Selecciona un área para ver sus evaluadores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mensajes */}
        {msg && (
          <div
            className={`mt-4 rounded-md px-3 py-2 text-sm flex items-center gap-2 ${
              msgType === 'ok'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {msgType === 'ok' && <CheckCircle2 className="w-4 h-4" />}
            <span>{msg}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            type="button"
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Guardando…' : 'Guardar asignación'}
          </Button>
        </div>
      </div>
    </div>
  );
}
