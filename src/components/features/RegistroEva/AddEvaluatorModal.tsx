'use client';

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Props = { onClose: () => void; onSuccess: () => void };
type Area = { id_area: number; nombre_area: string };

/** Lee mensajes de error de Axios/Nest/Prisma de forma robusta */
function getBackendError(err: any): string {
  const apiData = err?.response?.data;

  // 1) message string
  if (typeof apiData?.message === 'string') return apiData.message;

  // 2) message array (class-validator normalmente)
  if (Array.isArray(apiData?.message) && apiData.message.length) {
    return apiData.message.join(', ');
  }

  // 3) errors array
  if (Array.isArray(apiData?.errors) && apiData.errors.length) {
    return apiData.errors.join(', ');
  }

  // 4) estructura de class-validator: [{ constraints: { a: '...', b:'...' } }, ...]
  if (Array.isArray(apiData) && apiData.length && apiData[0]?.constraints) {
    const msgs = apiData
      .flatMap((e: any) => Object.values(e.constraints ?? {}))
      .filter(Boolean);
    if (msgs.length) return msgs.join(', ');
  }

  // 5) Fallbacks
  if (typeof apiData === 'string') return apiData;
  if (err?.message) return String(err.message);
  return 'No se pudo registrar (revisa conexión, token o duplicados).';
}

export default function AddEvaluatorModal({ onClose, onSuccess }: Props) {
  // form
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ci, setCi] = useState(''); // 🔹 CI
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
  const [msgType, setMsgType] = useState<'ok' | 'err' | null>(null);

  useEffect(() => {
    api
      .get<Area[]>('/areas')
      .then(({ data }) => setAreas(Array.isArray(data) ? data : []))
      .catch(() => setAreas([]));
  }, []);

  const toggleArea = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  async function validateFields() {
    const newErrors: { [k: string]: string } = {};

    // Nombre completo: solo letras + espacios, mínimo 2 palabras
    if (!nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es obligatorio';
    } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(nombreCompleto.trim())) {
      newErrors.nombreCompleto = 'Solo se permiten letras y espacios';
    } else if (nombreCompleto.trim().split(/\s+/).length < 2) {
      newErrors.nombreCompleto = 'Debe ingresar al menos nombre y apellido';
    }

    // Correo
    if (!correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (correo.includes(' ')) {
      newErrors.correo = 'El correo no debe contener espacios';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo.trim())) {
      newErrors.correo = 'Debe ingresar un correo válido';
    }

    // Teléfono: 8 dígitos
    if (!telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{8}$/.test(telefono.trim())) {
      newErrors.telefono = 'El teléfono debe tener 8 dígitos';
    } else {
      try {
        const { data } = await api.get(`/evaluadores?telefono=${telefono.trim()}`);
        if (Array.isArray(data) && data.length > 0) {
          newErrors.telefono = 'El teléfono ya está registrado en otro evaluador';
        }
      } catch {
        /* ignoramos errores de red en esta verificación */
      }
    }

    // CI: 6–8 dígitos
    if (!ci.trim()) {
      newErrors.ci = 'El CI es obligatorio';
    } else if (!/^\d{6,8}$/.test(ci.trim())) {
      newErrors.ci = 'El CI debe tener entre 6 y 8 dígitos numéricos';
    } else {
      try {
        const { data } = await api.get(`/evaluadores?ci=${ci.trim()}`);
        if (Array.isArray(data) && data.length > 0) {
          newErrors.ci = 'El CI ya está registrado en otro evaluador';
        }
      } catch {
        /* ignoramos errores de red en esta verificación */
      }
    }

    // Institución
    if (!institucion.trim()) {
      newErrors.institucion = 'La institución es obligatoria';
    } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(institucion.trim())) {
      newErrors.institucion = 'Solo se permiten letras y espacios';
    } else if (institucion.trim().length < 2) {
      newErrors.institucion = 'La institución es muy corta';
    }

    // Especialidad
    if (!especialidad.trim()) {
      newErrors.especialidad = 'La especialidad es obligatoria';
    } else if (especialidad.trim().length < 2) {
      newErrors.especialidad = 'La especialidad es muy corta';
    }

    // Experiencia 1–30
    if (!experiencia.trim()) {
      newErrors.experiencia = 'La experiencia es obligatoria';
    } else {
      const exp = Number(experiencia);
      if (Number.isNaN(exp) || exp < 1 || exp > 30) {
        newErrors.experiencia = 'La experiencia debe estar entre 1 y 30 años';
      }
    }

    // Áreas
    if (selected.length === 0) {
      newErrors.id_areas = 'Debe seleccionar al menos un área';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!(await validateFields())) {
      setMsgType('err');
      setMsg('❌ Debe completar todos los campos correctamente.');
      return;
    }

    setLoading(true);
    setMsg(null);
    setMsgType(null);

    try {
      await api.post('/evaluadores', {
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        ci: ci.trim(),
        institucion: institucion.trim(),
        especialidad: especialidad.trim(),
        experiencia: Number(experiencia),
        id_areas: selected,
      });

      setMsgType('ok');
      setMsg('✅ Evaluador registrado con éxito');
      onSuccess();
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      const backendMsg = getBackendError(err);
      setMsgType('err');
      setMsg(`❌ ${backendMsg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* tamaño compacto como el ejemplo */}
      <div className="bg-white p-6 rounded-xl w-[520px] max-w-[95vw] relative text-black shadow">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="text-xl mb-1 font-bold text-black">Registrar Nuevo Evaluador</h2>
        <p className="text-gray-500 mb-4">Complete la información del evaluador</p>

        {msg && (
          <div
            className={`mb-4 rounded-md px-3 py-2 text-sm ${
              msgType === 'ok'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre (span 2) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Ej: Juan Pérez"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
            {errors.nombreCompleto && <p className="text-red-500 text-sm mt-1">{errors.nombreCompleto}</p>}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Correo</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="78987654"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
          </div>

          {/* CI */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Documento de Identidad (CI)</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Ej: 9329167"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
            />
            {errors.ci && <p className="text-red-500 text-sm mt-1">{errors.ci}</p>}
          </div>

          {/* Especialización */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Especialización</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Área de especialización"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />
            {errors.especialidad && <p className="text-red-500 text-sm mt-1">{errors.especialidad}</p>}
          </div>

          {/* Institución */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Institución</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Universidad o institución"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
            />
            {errors.institucion && <p className="text-red-500 text-sm mt-1">{errors.institucion}</p>}
          </div>

          {/* Experiencia */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Años de experiencia</label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              type="number"
              placeholder="Ej: 7"
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
            />
            {errors.experiencia && <p className="text-red-500 text-sm mt-1">{errors.experiencia}</p>}
          </div>

          {/* Áreas */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-2">Áreas de Evaluación</label>
            <div className="rounded-md border border-gray-200 p-2 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {areas.length === 0 && <span className="text-sm text-gray-500">No hay áreas (o cargando)…</span>}
                {areas.map((a) => {
                  const active = selected.includes(a.id_area);
                  return (
                    <button
                      key={a.id_area}
                      type="button"
                      onClick={() => toggleArea(a.id_area)}
                      className={`px-3 py-1 rounded-md border text-sm transition ${
                        active
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
            {errors.id_areas && <p className="text-red-500 text-sm mt-1">{errors.id_areas}</p>}
          </div>

          {/* Botones */}
          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
