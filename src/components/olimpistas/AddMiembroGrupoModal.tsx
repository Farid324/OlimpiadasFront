// src/components/olimpistas/AddMiembroGrupoModal.tsx
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DEPARTAMENTOS, GRADOS } from "@/config/catalogs";
import type { GrupoMiembroInput } from "@/types/grupo";
import { useState } from "react";
import { checkMiembroPorCI } from "@/libs/grupos.api";

/* ===================== Zod schema ===================== */
/* Nota: no usamos preprocess/transform aquí para evitar 'unknown'. */
const schema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(1, "El nombre completo es obligatorio.")
    .regex(
      /^[\p{L}\s.'-]+$/u,
      "Ingrese solo letras y espacios (sin números ni símbolos)."
    )
    .max(100, "El nombre completo no debe superar 100 caracteres."),
  ci: z
    .string()
    .trim()
    .min(6, "El CI debe tener entre 6 y 12 dígitos.")
    .max(12, "El CI debe tener entre 6 y 12 dígitos.")
    .regex(/^\d+$/, "El CI solo admite números (sin puntos ni guiones)."),
  tutorContacto: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d+$/.test(v), "Ingrese solo números."),
  /* Acepta "" (usar del grupo) o un valor del catálogo */
  departamento: z
    .union([
      z.literal(""),
      z.enum(DEPARTAMENTOS as unknown as [string, ...string[]]),
    ])
    .optional(),
  /* Con valueAsNumber ya llega como number: validamos entero 1..6 */
  grado: z
    .number()
    .int("El grado debe ser un número entero.")
    .min(1, "El grado debe estar entre 1 y 6.")
    .max(6, "El grado debe estar entre 1 y 6."),
});

/* Tipamos FormData desde el schema para alinear exactamente con el resolver */
type FormData = z.infer<typeof schema>;

/* ===================== Componente ===================== */
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
    setError,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { grado: 1, departamento: "" },
    mode: "onBlur",
  });

  const [submitting, setSubmitting] = useState(false);

  const submit: SubmitHandler<FormData> = async (f) => {
    setSubmitting(true);
    try {
      const res = await checkMiembroPorCI(f.ci.trim());
      if (res.inGroup) {
        setError("ci", {
          type: "manual",
          message: `El olimpista ya pertenece al grupo “${
            res.group?.nombre ?? "existente"
          }”.`,
        });
        setSubmitting(false);
        return;
      }

      onAdd({
        nombreCompleto: f.nombreCompleto,
        ci: f.ci,
        tutorContacto: f.tutorContacto || undefined,
        // "" (usar del grupo) -> undefined
        departamento:
          f.departamento && f.departamento !== "" ? f.departamento : undefined,
        grado: f.grado,
      });

      reset({ grado: 1, departamento: "" });
      onClose();
    } catch {
      setError("ci", {
        type: "manual",
        message: "No se pudo validar la pertenencia. Intente nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-[560px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-black">
          Agregar Estudiante en Grupo Olimpista
        </h2>
        <p className="text-gray-500 mb-4">
          Complete la información del estudiante
        </p>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("nombreCompleto")}
                className="text-gray-700"
                placeholder="Nombre completo"
                aria-invalid={!!errors.nombreCompleto}
              />
              {errors.nombreCompleto && (
                <p className="text-red-500 text-sm">
                  {errors.nombreCompleto.message}
                </p>
              )}
            </div>

            {/* CI */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Cédula de identidad <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("ci")}
                className="text-gray-700"
                placeholder="00000000"
                aria-invalid={!!errors.ci}
              />
              {errors.ci && (
                <p className="text-red-500 text-sm">{errors.ci.message}</p>
              )}
            </div>

            {/* Contacto del tutor legal */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Contacto del tutor legal
              </label>
              <Input
                {...register("tutorContacto")}
                className="text-gray-700"
                placeholder="+591 7xxxxxxx"
                aria-invalid={!!errors.tutorContacto}
              />
              {errors.tutorContacto && (
                <p className="text-red-500 text-sm">
                  {errors.tutorContacto.message}
                </p>
              )}
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Departamento de procedencia
              </label>
              <select
                className="border rounded-md p-2 w-full text-gray-700"
                {...register("departamento")}
                defaultValue=""
                aria-invalid={!!errors.departamento}
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
                  {errors.departamento.message as string}
                </p>
              )}
            </div>

            {/* Grado */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Grado de escolaridad
              </label>
              <select
                className="border rounded-md p-2 w-full text-gray-700"
                {...register("grado", { valueAsNumber: true })}
                defaultValue={1}
                aria-invalid={!!errors.grado}
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

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Verificando..." : "Agregar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
