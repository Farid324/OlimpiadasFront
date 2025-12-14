//src/components/registroResponsables/RegisterResponsableModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '@/libs/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';

// Definir interfaces de Props y Areas correctamente
interface Props {
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  initial?: {
    id_usuario?: number;
    nombre?: string;
    correo?: string;
    telefono?: string;
    ci?: string;
    institucion?: string;
    especialidad?: string;
    experiencia?: string;
    id_area?: string;
  };
}

interface Area {
  id_area: number;
  nombre_area: string;
}

// Definición del esquema Zod para validaciones
const schema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/, 'Solo se permiten letras')
    .refine((v) => v.trim().split(/\s+/).length >= 2, {
      message: 'Debe ingresar nombre y apellido',
    })
    .refine(
      (v) =>
        v
          .trim()
          .split(/\s+/)
          .every((w) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(w)),
      {
        message: 'Cada nombre y apellido debe iniciar con mayúscula',
      },
    ),
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Correo inválido')
    .refine((v) => !v.includes(' '), {
      message: 'El correo no debe contener espacios',
    }),

  // Validación del teléfono (opcional)
  telefono: z.string().superRefine((value, ctx) => {
    const v = value.trim();
    if (v === '') return; // opcional

    if (!/^\d+$/.test(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El teléfono solo debe contener dígitos',
      });
      return;
    }

    if (v.length !== 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El teléfono debe tener exactamente 8 dígitos',
      });
    }

    if (!/^[67]/.test(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El teléfono debe iniciar con 6 o 7',
      });
    }
  }),

  ci: z
    .string()
    .min(6, 'El CI debe tener entre 6 y 12 dígitos')
    .max(12, 'El CI debe tener entre 6 y 12 dígitos')
    .regex(/^[0-9]+$/, 'El CI solo debe contener números'),

  institucion: z.string(),
  experiencia: z.string(),
  especialidad: z.string(),

  id_area: z.string().refine((v) => v !== '0', { message: 'Debe seleccionar un área' }),
});

type FormData = z.infer<typeof schema>;

// Definir Payload de Responsable
type ResponsablePayload = {
  nombre: string;
  apellido: string;
  correo: string;
  ci: string;
  id_area: number;
  telefono?: string;
  institucion?: string;
  especialidad?: string;
  experiencia?: number;
};

// Helper seguro para leer mensaje del backend (Nest/Axios)
function getBackendMessage(err: unknown): string | string[] | null {
  if (typeof err !== 'object' || err === null) return null;
  if (!('response' in err)) return null;

  const response = (err as { response?: unknown }).response;
  if (typeof response !== 'object' || response === null) return null;
  if (!('data' in response)) return null;

  const data = (response as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) return null;
  if (!('message' in data)) return null;

  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string' || Array.isArray(message)) return message;

  return null;
}

export default function RegisterResponsableModal({
  onClose,
  onSuccess,
  mode = 'create',
  initial,
}: Props) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dupError, setDupError] = useState<string | null>(null);
  const [lockAfterSuccess, setLockAfterSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Cargar valores iniciales si el modo es "editar"
  useEffect(() => {
    if (mode === 'edit' && initial) {
      setValue('nombre', initial.nombre || '');
      setValue('correo', initial.correo || '');
      setValue('telefono', initial.telefono || '');
      setValue('ci', initial.ci || '');
      setValue('institucion', initial.institucion || '');
      setValue('especialidad', initial.especialidad || '');
      setValue('experiencia', initial.experiencia || '');
      if (initial.id_area) setValue('id_area', initial.id_area);
    }
  }, [mode, initial, setValue]);

  // Obtener las áreas disponibles
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Area[]>('/areas');
        setAreas(data);
        if (mode === 'edit' && initial?.id_area) setValue('id_area', initial.id_area);
      } catch {
        console.error('Error al cargar áreas');
      }
    })();
  }, [mode, initial?.id_area, setValue]);

  // Función para manejar el submit
  const onSubmit = async (data: FormData) => {
    if (lockAfterSuccess) return;

    setLoading(true);
    setSuccessMsg(null);
    setDupError(null);

    try {
      // Normalizar los valores
      const correo = data.correo.trim();
      const ci = data.ci.trim();
      const telefono = data.telefono.trim();
      const institucion = data.institucion.trim();
      const especialidad = data.especialidad.trim();
      const expStr = data.experiencia.trim();

      // Validaciones de duplicados (solo en modo "crear")
      if (mode === 'create') {
        if (telefono !== '') {
          const tel = await api.get(`/responsables/check-telefono/${telefono}`);
          if (tel.data.exists) {
            setDupError('❌ El teléfono ya está registrado');
            setLoading(false);
            return;
          }
        }

        const [ciRes, correoRes] = await Promise.all([
          api.get(`/responsables/check-ci/${ci}`),
          api.get(`/responsables/check-correo/${correo}`),
        ]);

        if (ciRes.data.exists) {
          setDupError('❌ El CI ya está registrado');
          setLoading(false);
          return;
        }
        if (correoRes.data.exists) {
          setDupError('❌ El correo ya está registrado');
          setLoading(false);
          return;
        }
      }

      // Validación para un solo responsable por área
      const areaIdNum = Number(data.id_area);

      if (mode === 'create') {
        const areaRes = await api.get(`/responsables/check-area/${areaIdNum}`);
        if (areaRes.data?.exists) {
          setDupError('❌ Ya existe un responsable asignado a esta área');
          setLoading(false);
          return;
        }
      } else if (mode === 'edit') {
        const currentArea = initial?.id_area ? Number(initial.id_area) : undefined;
        if (currentArea !== undefined && areaIdNum !== currentArea) {
          const areaRes = await api.get(`/responsables/check-area/${areaIdNum}`);
          if (areaRes.data?.exists) {
            setDupError('❌ Ya existe un responsable asignado a esta área');
            setLoading(false);
            return;
          }
        }
      }

      // Separar nombre y apellido
      const partes = data.nombre.trim().split(/\s+/);
      let nombre = '';
      let apellido = '';

      if (partes.length === 4) {
        nombre = partes.slice(0, 2).join(' ');
        apellido = partes.slice(2).join(' ');
      } else if (partes.length === 3) {
        nombre = partes[0];
        apellido = partes.slice(1).join(' ');
      } else if (partes.length === 2) {
        nombre = partes[0];
        apellido = partes[1];
      } else {
        nombre = data.nombre;
        apellido = '';
      }

      // Convertir experiencia si no está vacía
      const experienciaNum = expStr !== '' ? Number(expStr) : undefined;

      // Crear el payload
      const payload: ResponsablePayload = {
        nombre,
        apellido,
        correo,
        ci,
        id_area: areaIdNum,
      };

      if (telefono !== '') payload.telefono = telefono;
      if (institucion !== '') payload.institucion = institucion;
      if (especialidad !== '') payload.especialidad = especialidad;
      if (experienciaNum !== undefined && !Number.isNaN(experienciaNum)) {
        payload.experiencia = experienciaNum;
      }

      if (mode === 'edit' && initial?.id_usuario) {
        await api.patch(`/responsables/${initial.id_usuario}`, payload);

        setSuccessMsg('Responsable actualizado correctamente');
        setLockAfterSuccess(true);

        setTimeout(() => {
          setLockAfterSuccess(false);
          setSuccessMsg(null);
          onSuccess();
          onClose();
        }, 1000);
      } else {
        await api.post('/responsables', payload);

        setSuccessMsg('Responsable registrado con éxito');
        setLockAfterSuccess(true);
        reset();

        setTimeout(() => {
          setLockAfterSuccess(false);
          setSuccessMsg(null);
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: unknown) {
      // Mostrar mensaje real del backend sin usar `any`
      console.error('Error al registrar/actualizar responsable', err);

      const backendMsg = getBackendMessage(err);

      if (Array.isArray(backendMsg)) setDupError(backendMsg.join(', '));
      else if (typeof backendMsg === 'string') setDupError(backendMsg);
      else setDupError('Ocurrió un error al registrar/actualizar responsable');
    } finally {
      setLoading(false);
    }
  };

  const selectedArea = watch('id_area');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-3">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Cerrar"
          disabled={lockAfterSuccess}
        >
          ✕
        </button>

        <h2 className="text-xl mb-2 font-bold text-black">
          {mode === 'edit' ? 'Editar Responsable' : 'Registrar Nuevo Responsable'}
        </h2>
        <p className="text-gray-500 mb-4">
          {mode === 'edit'
            ? 'Actualice la información del responsable'
            : 'Complete la información del responsable'}
        </p>

        {successMsg && (
          <div
            className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700"
            aria-live="polite"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        {dupError && <p className="text-red-600 text-sm mb-3">{dupError}</p>}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={lockAfterSuccess ? 'pointer-events-none opacity-75' : ''}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <Input placeholder="Ej: Juan Pérez" {...register('nombre')} />
              {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <Input placeholder="correo@ejemplo.com" {...register('correo')} />
              {errors.correo && <p className="text-red-500 text-sm">{errors.correo.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
              <Input placeholder="70000000" {...register('telefono')} />
              {errors.telefono && (
                <p className="text-red-500 text-sm">{errors.telefono.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Especialización</label>
              <Input placeholder="Área de especialización" {...register('especialidad')} />
              {errors.especialidad && (
                <p className="text-red-500 text-sm">{errors.especialidad.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Institución</label>
              <Input placeholder="Universidad o institución" {...register('institucion')} />
              {errors.institucion && (
                <p className="text-red-500 text-sm">{errors.institucion.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Años de Experiencia</label>
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                {...register('experiencia')}
                onKeyDown={(e) => {
                  const block = ['-', '+', 'e', 'E', '.'];
                  if (block.includes(e.key)) e.preventDefault();
                }}
                onInput={(e) => {
                  const el = e.currentTarget as HTMLInputElement;
                  el.value = el.value.replace(/\D/g, '').slice(0, 2);
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text');
                  if (!/^\d{1,2}$/.test(text)) e.preventDefault();
                }}
              />
              {errors.experiencia && <p className="text-red-500 text-sm">{errors.experiencia.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Documento de Identidad (CI) <span className="text-red-500">*</span>
              </label>
              <Input placeholder="Número de CI" {...register('ci')} />
              {errors.ci && <p className="text-red-500 text-sm">{errors.ci.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Área Designada <span className="text-red-500">*</span>
              </label>
              <select
                {...register('id_area')}
                className={`border rounded-md p-2 w-full text-sm ${
                  selectedArea === '0' ? 'text-gray-400' : 'text-black'
                }`}
              >
                <option value="0" hidden>
                  Seleccione un área
                </option>
                {areas.map((a) => (
                  <option key={a.id_area} value={a.id_area} className="text-black">
                    {a.nombre_area}
                  </option>
                ))}
              </select>
              {errors.id_area && <p className="text-red-500 text-sm">{errors.id_area.message}</p>}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-2 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              type="button"
              className="w-full md:w-auto"
              disabled={lockAfterSuccess}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={loading || lockAfterSuccess} className="w-full md:w-auto">
              {loading
                ? mode === 'edit'
                  ? 'Guardando...'
                  : 'Registrando...'
                : mode === 'edit'
                ? 'Guardar Cambios'
                : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
