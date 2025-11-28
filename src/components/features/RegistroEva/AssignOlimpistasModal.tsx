// src/components/features/RegistroEva/AssignOlimpistasModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, X } from 'lucide-react';

type Area = { id_area: number; nombre_area: string };

type EvaluadorLite = {
  id_usuario: number;
  nombre: string;
  apellido: string;
};

type Row = {
  id_usuario: number;
  nombreCompleto: string;
  cupoClasificacion: string;
  cupoFinal: string;
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  areaOptions: Area[];
  initialAreaId?: number;
  evaluadores: EvaluadorLite[];
};

export default function AssignOlimpistasModal({
  onClose,
  onSuccess,
  areaOptions,
  initialAreaId,
  evaluadores,
}: Props) {
  const [selectedArea, setSelectedArea] = useState<number | undefined>(
    initialAreaId,
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'ok' | 'err' | null>(null);

  // Por ahora la fase final estará bloqueada siempre.
  // Luego puedes cambiar esto a un valor dinámico según un endpoint de fases.
  const faseFinalHabilitada = false;

  useEffect(() => {
    const initRows: Row[] = evaluadores.map((e) => ({
      id_usuario: e.id_usuario,
      nombreCompleto: `${e.nombre} ${e.apellido}`,
      cupoClasificacion: '',
      cupoFinal: '',
    }));
    setRows(initRows);
  }, [evaluadores]);

  const areaLabel = useMemo(() => {
    if (!selectedArea) return '';
    const found = areaOptions.find((a) => a.id_area === selectedArea);
    return found?.nombre_area ?? '';
  }, [selectedArea, areaOptions]);

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
    if (!selectedArea) {
      setMsgType('err');
      setMsg('Selecciona un área.');
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
        id_area: selectedArea,
        asignaciones,
      });

      setMsgType('ok');
      setMsg('Cupos asignados correctamente.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ??
        'No se pudo asignar los cupos. Revisa los valores.';
      setMsgType('err');
      setMsg(
        Array.isArray(backendMsg) ? backendMsg.join(' / ') : String(backendMsg),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Asignar olimpistas a evaluadores
            </h2>
            <p className="text-xs text-gray-500">
              Define cuántos olimpistas evaluará cada evaluador en la fase
              clasificatoria y, más adelante, en la fase final.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Área */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Área
            </label>
            <select
              value={selectedArea ?? ''}
              onChange={(e) =>
                setSelectedArea(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full h-10 rounded-lg border border-gray-300 text-sm px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Selecciona un área…</option>
              {areaOptions.map((a) => (
                <option key={a.id_area} value={a.id_area}>
                  {a.nombre_area}
                </option>
              ))}
            </select>
            {areaLabel && (
              <p className="text-xs text-gray-500">
                Asignando para el área: <strong>{areaLabel}</strong>
              </p>
            )}
          </div>

          {/* Tabla de evaluadores */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Evaluador
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">
                    Fase clasificatoria
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">
                    Fase final
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_usuario} className="border-t">
                    <td className="px-3 py-2 text-gray-900">
                      {r.nombreCompleto}
                    </td>
                    <td className="px-3 py-2 text-center">
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
                        className="w-24 mx-auto text-center"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
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
                        className="w-24 mx-auto text-center"
                        disabled={!faseFinalHabilitada}
                      />
                      {!faseFinalHabilitada && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          Se habilitará cuando inicie la fase final.
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-gray-400 text-sm"
                    >
                      No hay evaluadores para esta área.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mensajes */}
          {msg && (
            <div
              className={`rounded-md px-3 py-2 text-sm flex items-center gap-2 ${
                msgType === 'ok'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {msgType === 'ok' && <CheckCircle2 className="w-4 h-4" />}
              <span>{msg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar asignación'}
          </Button>
        </div>
      </div>
    </div>
  );
}
