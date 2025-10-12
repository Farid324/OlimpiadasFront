'use client';

import { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '@/libs/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

//Validación Zod
const schema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/, 'Solo se permiten letras')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Debe ingresar nombre y apellido',
    })
    .refine(
      (val) =>
        val
          .trim()
          .split(/\s+/)
          .every((w) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(w)),
      { message: 'Cada nombre y apellido debe iniciar con mayúscula' }
    ),

  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Correo inválido')
    .refine((val) => !val.includes(' '), {
      message: 'El correo no debe contener espacios',
    }),

  telefono: z
    .string()
    .min(8, 'El teléfono debe tener 8 dígitos')
    .max(8, 'El teléfono debe tener 8 dígitos')
    .regex(/^[0-9]+$/, 'Solo se permiten números'),

  ci: z
    .string()
    .min(6, 'El CI debe tener entre 6 y 8 dígitos')
    .max(8, 'El CI debe tener entre 6 y 8 dígitos')
    .regex(/^[0-9]+$/, 'El CI solo debe contener números'),

  institucion: z
    .string()
    .min(2, 'La institución es obligatoria')
    .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/, 'Solo se permiten letras'),

  experiencia: z
    .string()
    .regex(/^[0-9]{1,2}$/, 'Debe ingresar 1 o 2 dígitos numéricos')
    .refine(
      (val) => {
        const n = Number(val);
        return n >= 1 && n <= 30;
      },
      { message: 'La experiencia debe estar entre 1 y 30 años' }
    ),

  especialidad: z.string().min(2, 'La especialidad es obligatoria'),

  id_area: z.string().refine((v) => v !== '0', {
    message: 'Debe seleccionar un área',
  }),
});

type FormData = z.infer<typeof schema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  //Precargar datos si es edición
  useEffect(() => {
    if (mode === 'edit' && initial) {
      setValue('nombre', initial.nombre || '');
      setValue('correo', initial.correo || '');
      setValue('telefono', initial.telefono || '');
      setValue('ci', initial.ci || '');
      setValue('institucion', initial.institucion || '');
      setValue('especialidad', initial.especialidad || '');
      setValue('experiencia', initial.experiencia || '');
      // id_area se asigna cuando las áreas estén cargadas
    }
  }, [mode, initial, setValue]);

  //Cargar áreas y asignar área actual si está en edición
  useEffect(() => {
    async function fetchAreas() {
      try {
        const { data } = await api.get<Area[]>('/areas');
        setAreas(data);

        // Si es edición y tiene área, asignamos el valor al select
        if (mode === 'edit' && initial?.id_area) {
          setValue('id_area', initial.id_area);
        }
      } catch {
        console.error('Error al cargar áreas');
      }
    }

    fetchAreas();
  }, [mode, initial?.id_area, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setSuccessMsg(null);
    setDupError(null);

    try {
      // Validar duplicados solo al crear
      if (mode === 'create') {
        const [tel, ci, correo] = await Promise.all([
          api.get(`/responsables/check-telefono/${data.telefono}`),
          api.get(`/responsables/check-ci/${data.ci}`),
          api.get(`/responsables/check-correo/${data.correo}`),
        ]);

        if (tel.data.exists) {
          setDupError('❌ El teléfono ya está registrado');
          setLoading(false);
          return;
        }
        if (ci.data.exists) {
          setDupError('❌ El CI ya está registrado');
          setLoading(false);
          return;
        }
        if (correo.data.exists) {
          setDupError('❌ El correo ya está registrado');
          setLoading(false);
          return;
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

      if (mode === 'edit' && initial?.id_usuario) {
        await api.patch(`/responsables/${initial.id_usuario}`, {
          ...data,
          nombre,
          apellido,
          experiencia: Number(data.experiencia),
          id_area: Number(data.id_area),
        });
        setSuccessMsg('Responsable actualizado correctamente');
      } else {
        await api.post('/responsables', {
          ...data,
          nombre,
          apellido,
          experiencia: Number(data.experiencia),
          id_area: Number(data.id_area),
        });
        setSuccessMsg('Responsable registrado correctamente');
      }

      reset();
      onSuccess();

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error al registrar/actualizar responsable', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedArea = watch('id_area');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl relative">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
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

        {successMsg && <p className="text-green-600 text-sm mb-3">{successMsg}</p>}
        {dupError && <p className="text-red-600 text-sm mb-3">{dupError}</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre Completo
              </label>
              <Input placeholder="Ej: Juan Pérez" {...register('nombre')} />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <Input placeholder="correo@ejemplo.com" {...register('correo')} />
              {errors.correo && (
                <p className="text-red-500 text-sm">{errors.correo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Teléfono
              </label>
              <Input placeholder="70000000" {...register('telefono')} />
              {errors.telefono && (
                <p className="text-red-500 text-sm">{errors.telefono.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Especialización
              </label>
              <Input placeholder="Área de especialización" {...register('especialidad')} />
              {errors.especialidad && (
                <p className="text-red-500 text-sm">{errors.especialidad.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Institución
              </label>
              <Input placeholder="Universidad o institución" {...register('institucion')} />
              {errors.institucion && (
                <p className="text-red-500 text-sm">{errors.institucion.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Años de Experiencia
              </label>
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
              {errors.experiencia && (
                <p className="text-red-500 text-sm">{errors.experiencia.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Documento de Identidad (CI)
              </label>
              <Input placeholder="Número de CI" {...register('ci')} />
              {errors.ci && <p className="text-red-500 text-sm">{errors.ci.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Área Designada
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
              {errors.id_area && (
                <p className="text-red-500 text-sm">{errors.id_area.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-2 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              type="button"
              className="w-full md:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
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
