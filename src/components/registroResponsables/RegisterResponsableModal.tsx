// src/components/registroResponsables/RegisterResponsableModal.tsx
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
}

interface Area {
  id_area: number;
  nombre_area: string;
}

//Esquema de validación con Zod
const schema = z.object({
  nombre: z.string()
    .min(1, "El nombre es obligatorio")
    .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/, "Solo se permiten letras"),
  correo: z.string()
    .min(1, "El correo es obligatorio")
    .email("Correo inválido")
    .refine((val) => !val.includes(" "), { message: "El correo no debe contener espacios" }),
  
});

type FormData = z.infer<typeof schema>;

export default function RegisterResponsableModal({ onClose, onSuccess }: Props) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dupError, setDupError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // 🔹 Cargar áreas
  useEffect(() => {
    async function fetchAreas() {
      try {
        const { data } = await api.get<Area[]>('/areas');
        setAreas(data);
      } catch {
        console.error("Error al cargar áreas");
      }
    }
    fetchAreas();
  }, []);

  // 🔹 Enviar formulario
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setSuccessMsg(null);
    setDupError(null);

    try {
      //Validar duplicados antes de registrar
      const telCheck = await api.get(`/responsables/check-telefono/${data.telefono}`);
      if (telCheck.data.exists) {
        setDupError("❌ El teléfono ya está registrado");
        setLoading(false);
        return;
      }

      const ciCheck = await api.get(`/responsables/check-ci/${data.ci}`);
      if (ciCheck.data.exists) {
        setDupError("❌ El documento de identidad ya está registrado");
        setLoading(false);
        return;
      }

      // ✅ Separar nombre y apellido según cantidad de palabras
      const palabras = data.nombre.trim().split(/\s+/);
      let nombre = "";
      let apellido = "";

      if (palabras.length === 4) {
        nombre = palabras.slice(0, 2).join(" ");
        apellido = palabras.slice(2).join(" ");
      } else if (palabras.length === 3) {
        nombre = palabras[0];
        apellido = palabras.slice(1).join(" ");
      } else if (palabras.length === 2) {
        nombre = palabras[0];
        apellido = palabras[1];
      } else {
        nombre = data.nombre;
        apellido = "";
      }

      // 🚀 Enviar al backend
      await api.post('/responsables', {
        ...data,
        nombre,
        apellido,
        experiencia: Number(data.experiencia),
        id_area: Number(data.id_area),
      });

      setSuccessMsg("✅ Registro realizado con éxito");
      reset();
      onSuccess();

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Error al registrar responsable", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-[500px] relative">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl mb-2 font-bold text-black">Registrar Nuevo Responsable</h2>
        <p className="text-gray-500 mb-4">Complete la información del responsable</p>

        {successMsg && (
          <p className="text-green-600 text-sm mb-3">{successMsg}</p>
        )}

        {dupError && (
          <p className="text-red-600 text-sm mb-3">{dupError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
              <Input placeholder="Nombre del responsable" {...register("nombre")} />
              {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
              <Input placeholder="correo@ejemplo.com" {...register("correo")} />
              {errors.correo && <p className="text-red-500 text-sm">{errors.correo.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
              <Input placeholder="70000000" {...register("telefono")} />
              {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Especialización</label>
              <Input placeholder="Área de especialización" {...register("especialidad")} />
              {errors.especialidad && <p className="text-red-500 text-sm">{errors.especialidad.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Institución</label>
              <Input placeholder="Universidad o institución" {...register("institucion")} />
              {errors.institucion && <p className="text-red-500 text-sm">{errors.institucion.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Años de Experiencia</label>
              <Input type="number" placeholder="Ej: 5" {...register("experiencia")} />
              {errors.experiencia && <p className="text-red-500 text-sm">{errors.experiencia.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Documento de Identidad (CI)</label>
              <Input placeholder="Número de CI" {...register("ci")} />
              {errors.ci && <p className="text-red-500 text-sm">{errors.ci.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Área Designada</label>
              <select {...register("id_area")} className="border rounded-md p-2 w-full">
                <option value="0">Seleccione un área</option>
                {areas.map((a) => (
                  <option key={a.id_area} value={a.id_area}>
                    {a.nombre_area}
                  </option>
                ))}
              </select>
              {errors.id_area && <p className="text-red-500 text-sm">{errors.id_area.message}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={onClose} variant="outline" type="button">Cancelar</Button>
            <Button type="submit" disabled={loading} className="ml-2">
              {loading ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
