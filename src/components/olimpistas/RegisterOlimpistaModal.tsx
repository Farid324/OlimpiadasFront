// src/components/olimpistas/RegisterOlimpistaModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/libs/api";
import {
  DEPARTAMENTOS,
  NIVELES_COMPETENCIA,
  GRADOS,
  NivelCompetencia,
} from "@/config/catalogs";
import { composeNivelCodigo } from "@/libs/nivel";

type Area = { id_area: number; nombre_area: string };

const schema = z.object({
  nombreCompleto: z
    .string()
    .min(1, "Requerido")
    .regex(/^[\p{L}\s.'-]+$/u, "Solo letras"),
  ci: z.string().min(6).max(12).regex(/^\d+$/, "Solo números"),
  tutorContacto: z.string().min(7).max(12).regex(/^\d+$/, "Solo números"),
  departamento: z.enum(DEPARTAMENTOS),
  unidadEducativa: z.string().min(2, "Requerido"),
  nivelCompetencia: z.enum(NIVELES_COMPETENCIA),
  grado: z.number().int().min(1).max(6),
  areaNombre: z.string().min(1, "Seleccione un área"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterOlimpistaModal({ onClose, onSuccess }: Props) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      grado: 1,
      nivelCompetencia: "Primaria" as NivelCompetencia,
    },
  });

  const nivelCompetencia = watch("nivelCompetencia");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Area[]>("/areas");
        setAreas(data);
        if (data.length) setValue("areaNombre", data[0].nombre_area);
      } catch {
        console.error("Error cargando áreas");
      }
    })();
  }, [setValue]);

  const onSubmit = async (f: FormData) => {
    setLoading(true);
    setSuccess(null);
    try {
      const nivelCatalogo = composeNivelCodigo(f.nivelCompetencia, f.grado);
      await api.post("/olimpistas/register", {
        nombreCompleto: f.nombreCompleto,
        ci: f.ci,
        tutorContacto: f.tutorContacto,
        unidadEducativa: f.unidadEducativa,
        departamento: f.departamento,
        area: f.areaNombre,
        nivel: nivelCatalogo,
        nivelCompetidor: f.nivelCompetencia,
        grado: f.grado,
      });
      setSuccess("✅ Olimpista registrado correctamente");
      onSuccess();
      setTimeout(onClose, 900);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const Pill = ({
    active,
    children,
    onClick,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      className={`px-3 py-1 rounded-md text-sm font-semibold border ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-gray-100 text-gray-800 border-gray-200"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-[640px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-black">
          Registrar Nuevo Olimpista
        </h2>
        <p className="text-gray-500 mb-4">
          Complete la información del Olimpista
        </p>

        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre Completo
              </label>
              <Input
                placeholder="Nombre completo"
                {...register("nombreCompleto")}
              />
              {errors.nombreCompleto && (
                <p className="text-red-500 text-sm">
                  {errors.nombreCompleto.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Cédula de identidad
              </label>
              <Input placeholder="0000000" {...register("ci")} />
              {errors.ci && (
                <p className="text-red-500 text-sm">{errors.ci.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Contacto del tutor legal
              </label>
              <Input
                placeholder="+591 70123456"
                {...register("tutorContacto")}
              />
              {errors.tutorContacto && (
                <p className="text-red-500 text-sm">
                  {errors.tutorContacto.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Departamento de procedencia
              </label>
              <select
                className="border rounded-md p-2 w-full"
                {...register("departamento")}
              >
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.departamento && (
                <p className="text-red-500 text-sm">
                  {errors.departamento.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Unidad Educativa
              </label>
              <Input placeholder="U.E. ..." {...register("unidadEducativa")} />
              {errors.unidadEducativa && (
                <p className="text-red-500 text-sm">
                  {errors.unidadEducativa.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Grado de escolaridad
              </label>
              <select
                className="border rounded-md p-2 w-full"
                {...register("grado", { valueAsNumber: true })}
              >
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g}ro.
                  </option>
                ))}
              </select>
              {errors.grado && (
                <p className="text-red-500 text-sm">{errors.grado.message}</p>
              )}
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nivel de competencia
            </label>
            <div className="flex gap-2">
              {NIVELES_COMPETENCIA.map((n) => (
                <Pill
                  key={n}
                  active={nivelCompetencia === n}
                  onClick={() => setValue("nivelCompetencia", n)}
                >
                  {n}
                </Pill>
              ))}
            </div>
            {errors.nivelCompetencia && (
              <p className="text-red-500 text-sm">
                {errors.nivelCompetencia.message}
              </p>
            )}
          </div>

          {}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Áreas de competencia
            </label>
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <Pill
                  key={a.id_area}
                  active={watch("areaNombre") === a.nombre_area}
                  onClick={() => setValue("areaNombre", a.nombre_area)}
                >
                  {a.nombre_area}
                </Pill>
              ))}
            </div>
            {errors.areaNombre && (
              <p className="text-red-500 text-sm">
                {errors.areaNombre.message}
              </p>
            )}
          </div>

          {}
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
