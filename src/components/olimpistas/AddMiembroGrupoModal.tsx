// src/components/olimpistas/AddMiembroGrupoModal.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DEPARTAMENTOS, GRADOS } from "@/config/catalogs";
import type { GrupoMiembroInput } from "@/types/grupo";

const schema = z.object({
  nombreCompleto: z
    .string()
    .min(1, "Requerido")
    .regex(/^[\p{L}\s.'-]+$/u, "Solo letras"),
  ci: z.string().min(6).max(12).regex(/^\d+$/, "Solo números"),
  tutorContacto: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d+$/.test(v), "Solo números"),
  departamento: z.enum(DEPARTAMENTOS).optional(),
  grado: z.number().int().min(1).max(6),
});
type FormData = z.infer<typeof schema>;

export default function AddMiembroGrupoModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (m: GrupoMiembroInput) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { grado: 1 },
  });

  const submit = (f: FormData) => {
    onAdd({
      nombreCompleto: f.nombreCompleto,
      ci: f.ci,
      tutorContacto: f.tutorContacto || undefined,
      departamento: f.departamento || undefined,
      grado: f.grado,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-[560px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-black">
          Agregar Estudiante en Grupo Olimpista
        </h2>
        <p className="text-gray-500 mb-4">
          Complete la información del estudiante
        </p>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre completo
              </label>
              <Input
                {...register("nombreCompleto")}
                className=" text-gray-700"
                placeholder="Nombre completo"
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
              <Input
                {...register("ci")}
                className=" text-gray-700"
                placeholder="00000000"
              />
              {errors.ci && (
                <p className="text-red-500 text-sm">{errors.ci.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Contacto del tutor legal
              </label>
              <Input
                {...register("tutorContacto")}
                className=" text-gray-700"
                placeholder="+591 7xxxxxxx"
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
                className="border rounded-md p-2 w-full text-gray-700"
                {...register("departamento")}
              >
                <option value="">(usar del grupo)</option>
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
                Grado de escolaridad
              </label>
              <select
                className="border rounded-md p-2 w-full text-gray-700"
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
