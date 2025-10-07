'use client';

import { useEffect, useState } from 'react';
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
  const [experiencia, setExperiencia] = useState('');

  // errores específicos por campo
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

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

  const toggleArea = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  function validateFields() {
    const newErrors: { [k: string]: string } = {};

    // Nombre completo obligatorio (mínimo dos palabras)
    if (!nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es obligatorio';
    } else {
      const words = nombreCompleto.trim().split(/\s+/);
      if (words.length < 2) {
        newErrors.nombreCompleto = 'Debe ingresar al menos nombre y apellido';
      } else if (nombreCompleto.trim().length < 5) {
        newErrors.nombreCompleto = 'El nombre completo es muy corto';
      }
    }

    // Correo obligatorio
    if (!correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo.trim())) {
      newErrors.correo = 'Debe ingresar un correo válido';
    }

    // Teléfono obligatorio
    if (!telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?\d{7,15}$/.test(telefono.trim())) {
      newErrors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos (opcional + al inicio)';
    }

    // Institución obligatoria
    if (!institucion.trim()) {
      newErrors.institucion = 'La institución es obligatoria';
    }

    // Especialidad obligatoria
    if (!especialidad.trim()) {
      newErrors.especialidad = 'La especialidad es obligatoria';
    }

    // Experiencia obligatoria
    if (!experiencia.trim()) {
      newErrors.experiencia = 'La experiencia es obligatoria';
    } else if (!/^\d+$/.test(experiencia)) {
      newErrors.experiencia = 'La experiencia debe ser un número';
    }

    // Áreas obligatorias
    if (selected.length === 0) {
      newErrors.id_areas = 'Debe seleccionar al menos un área';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateFields()) {
      setMsg('❌ Debe completar todos los campos correctamente.');
      return;
    }

    setLoading(true);
    setMsg(null);
    try {
      await api.post('/evaluadores', {
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        institucion: institucion.trim(),
        especialidad: especialidad.trim(),
        experiencia: Number(experiencia),
        id_areas: selected,
      });
      setMsg('✅ Evaluador registrado');
      onSuccess();
    } catch {
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold mb-1">Nombre Completo</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Ej: Juan Pérez"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
            {errors.nombreCompleto && <p className="text-red-500 text-sm">{errors.nombreCompleto}</p>}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-bold mb-1">Correo</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            {errors.correo && <p className="text-red-500 text-sm">{errors.correo}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-bold mb-1">Teléfono</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="+591 7xxxxxxx"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
          </div>

          {/* Especialidad */}
          <div>
            <label className="block text-sm font-bold mb-1">Especialidad</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Área de especialización"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />
            {errors.especialidad && <p className="text-red-500 text-sm">{errors.especialidad}</p>}
          </div>

          {/* Institución */}
          <div>
            <label className="block text-sm font-bold mb-1">Institución</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Universidad o institución"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
            />
            {errors.institucion && <p className="text-red-500 text-sm">{errors.institucion}</p>}
          </div>

          {/* Experiencia */}
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
            {errors.experiencia && <p className="text-red-500 text-sm">{errors.experiencia}</p>}
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
            {errors.id_areas && <p className="text-red-500 text-sm">{errors.id_areas}</p>}
          </div>
          
          {/* Botones */}
          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
