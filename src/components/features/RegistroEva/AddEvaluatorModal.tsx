//src/components/features/RegistroEva/AddEvaluatorModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  initial?: {
    id_usuario?: number;
    nombre?: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    ci?: string;
    institucion?: string;
    especialidad?: string;
    experiencia?: number;
    id_areas?: number[];
  } | undefined;
};

type Area = { id_area: number; nombre_area: string };
type ConstraintItem = { constraints?: Record<string, string> };
type BackendErrorResponse =
  | {
      message?: string | string[];
      errors?: string[];
    }
  | ConstraintItem[]
  | string
  | null
  | undefined;

/** Type guards mínimos y seguros */
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === 'string');
}
function isConstraintArray(x: unknown): x is ConstraintItem[] {
  return Array.isArray(x) && x.every((v) => isRecord(v));
}
function hasResponseData(x: unknown): x is { response: { data?: unknown } } {
  return isRecord(x) && isRecord(x.response);
}

/** Lee mensajes de error de Axios/Nest/Prisma de forma robusta */
function getBackendError(err: unknown): string {
  const apiData: BackendErrorResponse | undefined = hasResponseData(err)
    ? (err.response.data as BackendErrorResponse | undefined)
    : undefined;

  // message: string
  if (isRecord(apiData) && typeof apiData.message === 'string') return apiData.message;

  // message: string[]
  if (isRecord(apiData) && isStringArray(apiData.message)) return apiData.message.join(', ');

  // errors: string[]
  if (isRecord(apiData) && isStringArray(apiData.errors)) return apiData.errors.join(', ');

  // [{ constraints: {...} }, ...] (class-validator típicamente)
  if (isConstraintArray(apiData)) {
    const msgs = apiData
      .flatMap((e: ConstraintItem) => (e.constraints ? Object.values(e.constraints) : []))
      .filter((t): t is string => typeof t === 'string' && t.length > 0);
    if (msgs.length) return msgs.join(', ');
  }

  // data como string plano
  if (typeof apiData === 'string') return apiData;

  // fallback a Error.message si lo es
  if (err instanceof Error && err.message) return String(err.message);

  return 'No se pudo registrar (revisa conexión, token o duplicados).';
}

export default function AddEvaluatorModal({
  onClose,
  onSuccess,
  mode = 'create',
  initial,
}: Props) {
  // form
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ci, setCi] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [experiencia, setExperiencia] = useState('');

  // errores por campo
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // áreas
  const [areas, setAreas] = useState<Area[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);

  // banner error general
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'ok' | 'err' | null>(null);

  // banner éxito (igual que responsables)
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lockAfterSuccess, setLockAfterSuccess] = useState(false);

  // precarga en modo edición
  useEffect(() => {
    if (mode === 'edit' && initial) {
      const nc = `${initial.nombre ?? ''} ${initial.apellido ?? ''}`.trim();
      setNombreCompleto(nc);
      setCorreo(initial.correo ?? '');
      setTelefono(initial.telefono ?? '');
      setCi(initial.ci ?? '');
      setInstitucion(initial.institucion ?? '');
      setEspecialidad(initial.especialidad ?? '');
      setExperiencia(
        typeof initial.experiencia === 'number' ? String(initial.experiencia) : ''
      );
      setSelected(Array.isArray(initial.id_areas) ? initial.id_areas : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initial?.id_usuario]);

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

    // Nombre completo (obligatorio)
    if (!nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es obligatorio';
    } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(nombreCompleto.trim())) {
      newErrors.nombreCompleto = 'Solo se permiten letras y espacios';
    } else if (nombreCompleto.trim().split(/\s+/).length < 2) {
      newErrors.nombreCompleto = 'Debe ingresar al menos nombre y apellido';
    }

    // Correo (obligatorio)
    if (!correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (correo.includes(' ')) {
      newErrors.correo = 'El correo no debe contener espacios';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo.trim())) {
      newErrors.correo = 'Debe ingresar un correo válido';
    }

    // Teléfono (opcional)
    if (telefono.trim()) {
      const tel = telefono.trim();

      // 1) longitud / solo dígitos
      if (!/^\d+$/.test(tel) || tel.length !== 8) {
        newErrors.telefono =
          'El teléfono debe tener exactamente 8 dígitos numéricos';
      }
      // 2) empieza en 6 o 7
      else if (!/^[67]/.test(tel)) {
        newErrors.telefono = 'El teléfono debe comenzar con 6 o 7';
      }
    }

    // CI: 6–8 dígitos (obligatorio + duplicado)
    if (!ci.trim()) {
      newErrors.ci = 'El CI es obligatorio';
    } else if (!/^\d{6,8}$/.test(ci.trim())) {
      newErrors.ci = 'El CI debe tener entre 6 y 8 dígitos numéricos';
    } else if (!(mode === 'edit' && ci.trim() === (initial?.ci ?? ''))) {
      try {
        const { data } = await api.get(`/evaluadores?ci=${ci.trim()}`);
        if (Array.isArray(data) && data.length > 0) {
          newErrors.ci = 'El CI ya está registrado en otro evaluador';
        }
      } catch {
        /* ignore */
      }
    }

    // Áreas (obligatorio)
    if (selected.length === 0) {
      newErrors.id_areas = 'Debe seleccionar al menos un área';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lockAfterSuccess) return;

    if (!(await validateFields())) {
      setMsgType('err');
      setMsg('❌ Debe completar todos los campos correctamente.');
      return;
    }

    setLoading(true);
    setMsg(null);
    setMsgType(null);
    setSuccessMsg(null);

    // separa nombreCompleto
    const [first, ...rest] = nombreCompleto.trim().split(/\s+/);
    const nombre = first ?? '';
    const apellido = rest.join(' ') || '';

    // Campos opcionales: se envían vacío o no se envían
    const telefonoFinal = telefono.trim() || '';
    const institucionFinal = institucion.trim() || '';
    const especialidadFinal = especialidad.trim() || '';

    // Experiencia: si está vacía NO se envía (backend pone 1)
    const experienciaFinal =
      experiencia.trim() !== '' ? Number(experiencia.trim()) : undefined;

    const payload: any = {
      nombreCompleto: nombreCompleto.trim(),
      nombre,
      apellido,
      correo: correo.trim(),
      telefono: telefonoFinal,
      ci: ci.trim(),
      institucion: institucionFinal,
      especialidad: especialidadFinal,
      id_areas: selected,
    };

    if (experienciaFinal !== undefined) {
      payload.experiencia = experienciaFinal;
    }

    try {
      if (mode === 'edit' && initial?.id_usuario) {
        await api.patch(`/evaluadores/${initial.id_usuario}`, payload);
        setSuccessMsg('Evaluador actualizado correctamente');
      } else {
        await api.post('/evaluadores', payload);
        setSuccessMsg('Evaluador registrado con éxito');
      }

      setLockAfterSuccess(true);
      setTimeout(() => {
        setLockAfterSuccess(false);
        setSuccessMsg(null);
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const backendMsg = getBackendError(err);
      setMsgType('err');
      setMsg(`❌ ${backendMsg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-screen-md sm:max-w-3xl md:max-w-4xl relative text-black shadow max-h-[90vh] overflow-y-auto">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Cerrar"
          type="button"
          disabled={lockAfterSuccess}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-1">
          {mode === 'edit' ? 'Editar Evaluador' : 'Registrar Nuevo Evaluador'}
        </h2>
        <p className="text-gray-500 mb-4">
          {mode === 'edit'
            ? 'Actualice la información del evaluador'
            : 'Complete la información del evaluador'}
        </p>

        {/* Banner éxito estilo responsables */}
        {successMsg && (
          <div
            className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700"
            aria-live="polite"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        {/* Banner error general */}
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

        <form
          onSubmit={handleSubmit}
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
            lockAfterSuccess ? 'pointer-events-none opacity-75' : ''
          }`}
        >
          {/* Nombre (span 2) */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nombre Completo
            </label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Ej: Juan Pérez"
              autoComplete="name"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
            {errors.nombreCompleto && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nombreCompleto}
              </p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Correo
            </label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            {errors.correo && (
              <p className="text-red-500 text-sm mt-1">{errors.correo}</p>
            )}
          </div>

          {/* Teléfono (opcional) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Teléfono
            </label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="78987654"
              inputMode="numeric"
              autoComplete="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
            />
            {errors.telefono && (
              <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* CI */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Documento de Identidad (CI)
            </label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Ej: 9329167"
              inputMode="numeric"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
            />
            {errors.ci && (
              <p className="text-red-500 text-sm mt-1">{errors.ci}</p>
            )}
          </div>

          {/* Especialización (opcional) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Especialización
            </label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Área de especialización"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />
            {errors.especialidad && (
              <p className="text-red-500 text-sm mt-1">
                {errors.especialidad}
              </p>
            )}
          </div>

          {/* Institución (opcional) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Institución
            </label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              placeholder="Universidad o institución"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
            />
            {errors.institucion && (
              <p className="text-red-500 text-sm mt-1">
                {errors.institucion}
              </p>
            )}
          </div>

          {/* Experiencia (opcional) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Años de experiencia
            </label>
            <Input
              className="text-gray-900 placeholder:text-gray-400"
              type="number"
              placeholder="Ej: 7"
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
            />
            {errors.experiencia && (
              <p className="text-red-500 text-sm mt-1">
                {errors.experiencia}
              </p>
            )}
          </div>

          {/* Áreas */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold mb-2">
              Áreas de Evaluación
            </label>
            <div className="rounded-md border border-gray-200 p-2 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {areas.length === 0 && (
                  <span className="text-sm text-gray-500">
                    No hay áreas (o cargando)…
                  </span>
                )}
                {areas.map((a) => {
                  const active = selected.includes(a.id_area);
                  return (
                    <button
                      key={a.id_area}
                      type="button"
                      onClick={() => toggleArea(a.id_area)}
                      className={`px-3 py-1 rounded-md border text-sm transition font-bold ${
                        active
                          ? 'bg-gray-900 text-white border-gray-900 font-bold'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 font-bold'
                      }`}
                      title={a.nombre_area}
                    >
                      {a.nombre_area}
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.id_areas && (
              <p className="text-red-500 text-sm mt-1">{errors.id_areas}</p>
            )}
          </div>

          {/* Botones */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
              disabled={lockAfterSuccess}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || lockAfterSuccess}
              className="w-full sm:w-auto"
            >
              {loading
                ? mode === 'edit'
                  ? 'Guardando…'
                  : 'Guardando…'
                : mode === 'edit'
                ? 'Guardar cambios'
                : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
