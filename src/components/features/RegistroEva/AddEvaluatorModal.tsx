'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Props = { onClose: () => void; onSuccess: () => void };
type Area = { id_area: number; nombre_area: string };

export default function AddEvaluatorModal({ onClose, onSuccess }: Props) {
  // form
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [experiencia, setExperiencia] = useState(''); // string -> number
  const [responsable, setResponsable] = useState(false);

  // áreas
  const [areas, setAreas] = useState<Area[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    api.get<Area[]>('/areas')
      .then(({ data }) => setAreas(Array.isArray(data) ? data : []))
      .catch(() => setAreas([]));
  }, []);

  const canSubmit = useMemo(() => {
    const okNombre = nombreCompleto.trim().length >= 3;
    const okCorreo = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo.trim());
    const okExp = !experiencia || /^\d+$/.test(experiencia);
    const okAreas = selected.length > 0;
    return okNombre && okCorreo && okExp && okAreas;
  }, [nombreCompleto, correo, experiencia, selected]);

  const toggleArea = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setMsg('Completa los campos obligatorios y selecciona al menos un área.');
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await api.post('/evaluadores', {
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
        institucion: institucion.trim() || undefined,
        especialidad: especialidad.trim() || undefined,
        experiencia: experiencia ? Number(experiencia) : undefined,
        id_areas: selected,
        responsable,
      });
      setMsg('✅ Evaluador registrado');
      onSuccess();
    } catch (err: any) {
      setMsg('❌ No se pudo registrar (revisa conexión, token o duplicados).');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-[1000px] max-w-[95vw] relative text-black">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-1">Registrar Nuevo Evaluador</h2>
        <p className="text-gray-500 mb-4">Complete la información del evaluador</p>

        {msg && <p className="mb-3 text-sm">{msg}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold mb-1">Nombre Completo</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Nombre y apellidos"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Correo</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Teléfono</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="+591 7xxxxxxx"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Especialidad</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Área de especialización"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Institución</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Universidad o institución"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Años de experiencia</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              type="number"
              min={0}
              max={60}
              placeholder="Ej: 7"
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
            />
          </div>

          {/* Áreas (scroll) */}
          <div className="col-span-2">
            <label className="block text-sm font-bold mb-2">Áreas de Evaluación</label>
            <div className="rounded-md border border-gray-200 p-2 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {areas.length === 0 && (
                  <span className="text-sm text-gray-500">No hay áreas (o cargando)…</span>
                )}
                {areas.map((a) => {
                  const active = selected.includes(a.id_area);
                  return (
                    <button
                      key={a.id_area}
                      type="button"
                      onClick={() => toggleArea(a.id_area)}
                      className={`px-3 py-1 rounded-md border text-sm transition
                        ${active
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                        }`}
                      title={a.nombre_area}
                    >
                      {a.nombre_area}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona al menos una área. Si hay muchas, usa la barra de desplazamiento.
            </p>
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <input
              id="resp"
              type="checkbox"
              checked={responsable}
              onChange={(e) => setResponsable(e.target.checked)}
            />
            <label htmlFor="resp" className="text-sm">Designar como responsable de área</label>
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || !canSubmit}>
              {loading ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
