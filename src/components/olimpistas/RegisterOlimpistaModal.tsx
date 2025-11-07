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
import RegisterTutorModal from "@/components/olimpistas/RegisterTutorModal";
import { VM } from "@/config/validation-messages";
import axios from "axios";
import { CheckCircle2, Info } from "lucide-react";

type Area = { id_area: number; nombre_area: string };

// ====== Validaciones Zod (en español) ======
const schema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(1, "El nombre completo es obligatorio")
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: "Ingrese nombre y apellido",
    })
    .regex(/^[\p{L}\s.'-]+$/u, "Solo se permiten letras y espacios"),
  ci: z
    .string()
    .trim()
    .min(6, "El CI debe tener entre 6 y 12 dígitos")
    .max(12, "El CI debe tener entre 6 y 12 dígitos")
    .regex(/^\d+$/, "El CI solo debe contener números"),
  tutorContacto: z
    .string()
    .trim()
    .min(7, "El contacto del tutor debe tener entre 7 y 12 dígitos")
    .max(12, "El contacto del tutor debe tener entre 7 y 12 dígitos")
    .regex(/^\d+$/, "El contacto del tutor solo debe contener números"),
  departamento: z.enum(DEPARTAMENTOS, { message: VM.deptRequired }),
  unidadEducativa: z
    .string()
    .trim()
    .min(2, VM.ueMin)
    .max(80, VM.max80)
    .regex(/^[\p{L}\s.'-]+$/u, VM.onlyLetters),
  nivelCompetencia: z.enum(NIVELES_COMPETENCIA, { message: VM.levelRequired }),
  grado: z.number().int().min(1, VM.gradeRange).max(6, VM.gradeRange),
  areaNombre: z.string().min(1, VM.areaRequired),
});

type FormData = z.infer<typeof schema>;
type Feedback = { type: "success" | "error"; text: string } | null;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterOlimpistaModal({ onClose, onSuccess }: Props) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      grado: 1,
      nivelCompetencia: "Primaria" as NivelCompetencia,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [showTutor, setShowTutor] = useState(false);
  const [tutorMsg, setTutorMsg] = useState<string | null>(null);

  const nivelCompetencia = watch("nivelCompetencia");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Area[]>("/areas");
        setAreas(data);
        if (data.length) setValue("areaNombre", data[0].nombre_area);
      } catch {
        // Silencioso, solo consola
        console.error("Error cargando áreas");
      }
    })();
  }, [setValue]);

  const onSubmit = async (f: FormData) => {
    setLoading(true);
    setFeedback(null);
    try {
      const gradoEscolar = composeNivelCodigo(f.nivelCompetencia, f.grado);
      await api.post("/olimpistas/register", {
        nombreCompleto: f.nombreCompleto.trim().replace(/\s+/g, " "),
        ci: f.ci.trim(),
        tutorContacto: f.tutorContacto.trim(),
        unidadEducativa: f.unidadEducativa.trim().replace(/\s+/g, " "),
        departamento: f.departamento,
        area: f.areaNombre,
        nivel: f.nivelCompetencia,
        grado: f.grado,
        gradoEscolar,
      });

      setFeedback({ type: "success", text: "Olimpista registrado correctamente." });
      onSuccess();

      // Cerrar tras un breve tiempo para alcanzar a leer el banner
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      let msg = "Ocurrió un error al registrar.";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const m = data?.message;
        if (Array.isArray(m)) msg = m.join("\n");
        else if (typeof m === "string") msg = m;
        else if (typeof err.message === "string") msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "string") {
        msg = err;
      }
      // Tema blanco/azul también para errores
      setFeedback({ type: "error", text: msg });
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

  const getOrdinalSuffix = (num: number): string => {
    switch (num) {
      case 1:
        return "ro";
      case 2:
        return "do";
      case 3:
        return "ro";
      case 4:
      case 5:
      case 6:
        return "to";
      default:
        return "ro";
    }
  };

  // ====== Banner blanco/azul reutilizable ======
  const Banner = ({ fb, onCloseBanner }: { fb: Exclude<Feedback, null>; onCloseBanner: () => void }) => {
    const isSuccess = fb.type === "success";
    return (
      <div
        role="alert"
        className="mb-3 rounded-xl border bg-white px-4 py-3 flex items-start gap-3 shadow-sm border-blue-200"
      >
        <div className="mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
          ) : (
            <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />
          )}
        </div>
        <div className="text-sm">
          <p className="font-semibold text-blue-900">
            {isSuccess ? "Registro exitoso" : "No se pudo completar el registro"}
          </p>
          <p className="text-blue-700 whitespace-pre-line">{fb.text}</p>
        </div>
        <button
          type="button"
          onClick={onCloseBanner}
          aria-label="Cerrar mensaje"
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-blue-700 hover:bg-blue-50"
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-[640px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-black">Registrar Nuevo Olimpista</h2>
        <p className="text-gray-500 mb-4">Complete la información del Olimpista</p>

        {/* Banner blanco/azul (éxito / error) */}
        {feedback && <Banner fb={feedback} onCloseBanner={() => setFeedback(null)} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre Completo
              </label>
              <Input
                placeholder="Ej: Juan Pérez"
                className="placeholder:text-gray-400 text-gray-700"
                {...register("nombreCompleto")}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.value = t.value
                    .replace(/[^ \p{L}.'-]/gu, "")
                    .replace(/\s+/g, " ")
                    .trimStart();
                }}
              />
              {errors.nombreCompleto && (
                <p className="text-red-500 text-sm">{errors.nombreCompleto.message}</p>
              )}
            </div>

            {/* CI */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Cédula de identidad
              </label>
              <Input
                placeholder="0000000"
                className="placeholder:text-gray-400 text-gray-700"
                {...register("ci")}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.value = t.value.replace(/\D/g, "").slice(0, 12);
                }}
              />
              {errors.ci && <p className="text-red-500 text-sm">{errors.ci.message}</p>}
            </div>

            {/* Contacto tutor */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Contacto del tutor legal
              </label>
              <div className="flex gap-2">
                <Input
                  className="flex-1 text-gray-700"
                  placeholder="+591 70123456"
                  {...register("tutorContacto")}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.value = t.value.replace(/\D/g, "").slice(0, 12);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowTutor(true)}
                  className="px-1 py-2 border rounded-md bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
                >
                  Registrar tutor
                </button>
              </div>
              {errors.tutorContacto && (
                <p className="text-red-500 text-sm">{errors.tutorContacto.message}</p>
              )}
              {tutorMsg && <p className="text-green-700 text-sm mt-1">{tutorMsg}</p>}

              {showTutor && (
                <RegisterTutorModal
                  onClose={() => setShowTutor(false)}
                  onSuccess={({ telefono, linked, tutorNombre }) => {
                    setValue("tutorContacto", telefono, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    setTutorMsg(
                      `Tutor “${tutorNombre}” guardado. ${linked} olimpista(s) vinculados automáticamente.`
                    );

                    setShowTutor(false);
                    setTimeout(() => setTutorMsg(null), 3500);
                  }}
                />
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
              >
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.departamento && (
                <p className="text-red-500 text-sm">{errors.departamento.message}</p>
              )}
            </div>

            {/* Unidad Educativa */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Unidad Educativa
              </label>
              <Input
                placeholder="U.E."
                inputMode="text"
                pattern="[\\p{L}\\s.'-]+"
                maxLength={80}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.value = t.value
                    .replace(/[^ \p{L}.'-]/gu, "")
                    .replace(/\s+/g, " ")
                    .trimStart();
                }}
                className="placeholder:text-gray-400 text-gray-700"
                {...register("unidadEducativa")}
              />
              {errors.unidadEducativa && (
                <p className="text-red-500 text-sm">{errors.unidadEducativa.message}</p>
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
              >
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                    {getOrdinalSuffix(g)}.{" "}
                  </option>
                ))}
              </select>
              {errors.grado && (
                <p className="text-red-500 text-sm">{errors.grado.message}</p>
              )}
            </div>
          </div>

          {/* Nivel de competencia */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nivel de competencia
            </label>
            <div className="flex gap-2">
              {NIVELES_COMPETENCIA.map((n) => (
                <Pill
                  key={n}
                  active={nivelCompetencia === n}
                  onClick={() => setValue("nivelCompetencia", n, { shouldValidate: true })}
                >
                  {n}
                </Pill>
              ))}
            </div>
            {errors.nivelCompetencia && (
              <p className="text-red-500 text-sm">{errors.nivelCompetencia.message}</p>
            )}
          </div>

          {/* Áreas */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Áreas de competencia
            </label>
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <Pill
                  key={a.id_area}
                  active={watch("areaNombre") === a.nombre_area}
                  onClick={() => setValue("areaNombre", a.nombre_area, { shouldValidate: true })}
                >
                  {a.nombre_area}
                </Pill>
              ))}
            </div>
            {errors.areaNombre && (
              <p className="text-red-500 text-sm">{errors.areaNombre.message}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
