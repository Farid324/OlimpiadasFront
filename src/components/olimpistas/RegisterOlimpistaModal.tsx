// src/components/olimpistas/RegisterOlimpistaModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
import { CheckCircle2 } from "lucide-react";

type Area = {
  id_area: number;
  nombre_area: string;
  // NUEVO: campos que ahora llegan del backend para filtrar por nivel
  niveles_target?: string | null;
  nivelesTarget?: string[];
};

// ========= Esquema Zod (todas las validaciones de campos) =========
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

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  /** create por defecto, edit cuando vengas desde el menú de 3 puntos */
  mode?: "create" | "edit";
  /** id_inscripcion del olimpista (rows.id) cuando se edita */
  olimpistaId?: number;
}

export default function RegisterOlimpistaModal({
  onClose,
  onSuccess,
  mode = "create",
  olimpistaId,
}: Props) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);

  // Banner de éxito
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lockAfterSuccess, setLockAfterSuccess] = useState(false);

  // Carga inicial cuando es modo edición
  const [initialLoading, setInitialLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      grado: 1,
      nivelCompetencia: "Primaria" as NivelCompetencia,
      departamento: "La Paz",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [showTutor, setShowTutor] = useState(false);
  const [tutorMsg, setTutorMsg] = useState<string | null>(null);

  const nivelCompetencia = watch("nivelCompetencia");
  const areaNombre = watch("areaNombre");

  // 🔹 Función auxiliar: decide si un área pertenece al nivel actual
  const areaMatchesNivel = (area: Area, nivel: NivelCompetencia) => {
    const tags =
      area.nivelesTarget && area.nivelesTarget.length
        ? area.nivelesTarget
        : area.niveles_target
        ? String(area.niveles_target)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    // Si el área no tiene niveles_target configurado, la mostramos para ambos niveles
    if (!tags.length) return true;

    return tags.some(
      (tag) => tag.toLowerCase() === nivel.toLowerCase(), // ej: "Primaria" / "Secundaria"
    );
  };

  // 🔹 Lista de áreas filtradas según el nivel seleccionado (Primaria / Secundaria)
  const filteredAreas = useMemo(
    () => areas.filter((a) => areaMatchesNivel(a, nivelCompetencia)),
    [areas, nivelCompetencia],
  );

  // Cargar ÁREAS
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Area[]>("/areas");
        setAreas(data);

        // Mantener comportamiento original, pero si es create,
        // y el área actual no es válida, asignamos una por defecto.
        if (data.length && mode === "create") {
          const currentArea = areaNombre;
          const existsCurrent = data.some(
            (a) => a.nombre_area === currentArea,
          );

          if (!existsCurrent) {
            // Preferimos una que coincida con el nivel actual
            const firstMatch = data.find((a) =>
              areaMatchesNivel(a, nivelCompetencia),
            );
            setValue(
              "areaNombre",
              firstMatch ? firstMatch.nombre_area : data[0].nombre_area,
              {
                shouldValidate: true,
              },
            );
          }
        }
      } catch {
        console.error("Error cargando áreas");
      }
    })();
  }, [setValue, mode, areaNombre, nivelCompetencia]);

  // 🔹 Si cambia el nivel (Primaria / Secundaria) y el área seleccionada ya no pertenece
  //     a ese nivel, asignamos la primera del filtro.
  useEffect(() => {
    if (!filteredAreas.length) return;

    const stillValid = filteredAreas.some(
      (a) => a.nombre_area === areaNombre,
    );

    if (!stillValid) {
      setValue("areaNombre", filteredAreas[0].nombre_area, {
        shouldValidate: true,
      });
    }
  }, [filteredAreas, areaNombre, setValue]);

  // Si es modo EDICIÓN, cargar datos del olimpista desde el back
  useEffect(() => {
    if (mode !== "edit" || !olimpistaId) return;

    const fetchOlimpista = async () => {
      try {
        setInitialLoading(true);
        const { data } = await api.get(`/olimpistas/${olimpistaId}`);

        reset(
          {
            nombreCompleto: data.nombreCompleto,
            ci: data.ci,
            tutorContacto: data.tutorContacto,
            unidadEducativa: data.unidadEducativa,
            departamento: data.departamento,
            nivelCompetencia: data.nivelCompetencia as NivelCompetencia,
            grado: data.grado,
            areaNombre: data.area,
          },
          { keepDefaultValues: false },
        );
      } catch (err) {
        console.error("Error cargando datos del olimpista", err);
      } finally {
        setInitialLoading(false);
      }
    };

    void fetchOlimpista();
  }, [mode, olimpistaId, reset]);

  const onSubmit = async (f: FormData) => {
    if (lockAfterSuccess) return;

    setLoading(true);
    setSuccessMsg(null);

    try {
      const gradoEscolar = composeNivelCodigo(f.nivelCompetencia, f.grado);

      if (mode === "edit" && olimpistaId) {
        // Actualizar
        await api.patch(`/olimpistas/${olimpistaId}`, {
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
      } else {
        // Crear (comportamiento original)
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
      }

      const msg =
        mode === "edit"
          ? "Olimpista actualizado con éxito"
          : "Olimpista registrado con éxito";

      // Banner de éxito
      setSuccessMsg(msg);
      setLockAfterSuccess(true);

      setTimeout(() => {
        setLockAfterSuccess(false);
        setSuccessMsg(null);
        onSuccess(); // el padre refresca la lista
        onClose(); // cerramos el modal después de 1s
      }, 1000);
    } catch (err: unknown) {
      // CI duplicado -> error bajo el campo CI (sin banner azul)
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string | string[] }
          | undefined;
        const rawMsg = Array.isArray(data?.message)
          ? data?.message.join(" ")
          : typeof data?.message === "string"
          ? data.message
          : "Error desconocido";

        const text = rawMsg.toLowerCase();

        if (
          text.includes("ci ya está registrado") ||
          text.includes("ci ya esta registrado")
        ) {
          setError("ci", {
            type: "server",
            message: "El CI ya se encuentra registrado",
          });
        }
        // 2. Manejo de error de Tutor no encontrado (NUEVO)
        else if (
          text.includes("debe registrar un tutor") ||
          text.includes("tutor")
        ) {
          setError("tutorContacto", {
            type: "server",
            message:
              "Este número no está registrado. Haga clic en 'Registrar tutor'.",
          });
        }
        // 3. Otros errores (ej: Gestión cerrada)
        else {
          alert(`Error: ${rawMsg}`);
          console.error(
            mode === "edit"
              ? "Error al actualizar olimpista"
              : "Error al registrar olimpista",
            err,
          );
        }
      } else {
        console.error(
          mode === "edit"
            ? "Error al actualizar olimpista"
            : "Error al registrar olimpista",
          err,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // === Pill negro ===
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
          ? "bg-black text-white border-black"
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-[640px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Cerrar"
          disabled={lockAfterSuccess}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-black">
          {mode === "edit" ? "Editar Olimpista" : "Registrar Nuevo Olimpista"}
        </h2>
        <p className="text-gray-500 mb-4">
          {mode === "edit"
            ? "Actualice la información del Olimpista"
            : "Complete la información del Olimpista"}
        </p>

        {/* Banner de éxito */}
        {successMsg && (
          <div
            className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700"
            aria-live="polite"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        {initialLoading && (
          <p className="text-sm text-gray-500 mb-3">
            Cargando datos del olimpista...
          </p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={
            lockAfterSuccess || initialLoading
              ? "pointer-events-none opacity-75"
              : ""
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre Completo <span className="text-red-500">*</span>
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
                placeholder="0000000"
                className="placeholder:text-gray-400 text-gray-700"
                {...register("ci")}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.value = t.value.replace(/\D/g, "").slice(0, 12);
                }}
              />
              {errors.ci && (
                <p className="text-red-500 text-sm">{errors.ci.message}</p>
              )}
            </div>

            {/* Contacto tutor */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Contacto del tutor legal{" "}
                <span className="text-red-500">*</span>
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
                <p className="text-red-500 text-sm">
                  {errors.tutorContacto.message}
                </p>
              )}
              {tutorMsg && (
                <p className="text-green-700 text-sm mt-1">{tutorMsg}</p>
              )}

              {showTutor && (
                <RegisterTutorModal
                  onClose={() => setShowTutor(false)}
                  onSuccess={({ telefono, linked, tutorNombre }) => {
                    setValue("tutorContacto", telefono, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    setTutorMsg(
                      `Tutor “${tutorNombre}” guardado. ${linked} olimpista(s) vinculados automáticamente.`,
                    );

                    setShowTutor(false);
                    setTimeout(() => setTutorMsg(null), 3500);
                  }}
                />
              )}
            </div>

            {/* Departamento */}
            <div>
              <label className="block text.sm font-bold text-gray-700 mb-1">
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
                <p className="text-red-500 text-sm">
                  {errors.departamento.message}
                </p>
              )}
            </div>

            {/* Unidad Educativa */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Unidad Educativa <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="U.E. Santa María"
                inputMode="text"
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
                <p className="text-red-500 text-sm">
                  {errors.unidadEducativa.message}
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
              >
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                    {getOrdinalSuffix(g)}.
                  </option>
                ))}
              </select>
              {errors.grado && (
                <p className="text-red-500 text-sm">{errors.grado.message}</p>
              )}
            </div>
          </div>

          {/* Nivel de competencia */}
          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nivel de competencia
            </label>
            <div className="flex gap-2">
              {NIVELES_COMPETENCIA.map((n) => (
                <Pill
                  key={n}
                  active={nivelCompetencia === n}
                  onClick={() =>
                    setValue("nivelCompetencia", n, { shouldValidate: true })
                  }
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

          {/* Áreas */}
          <div className="mt-3">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Áreas de competencia
            </label>
            <div className="flex flex-wrap gap-2">
              {filteredAreas.map((a) => (
                <Pill
                  key={a.id_area}
                  active={areaNombre === a.nombre_area}
                  onClick={() =>
                    setValue("areaNombre", a.nombre_area, {
                      shouldValidate: true,
                    })
                  }
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

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4 mt-2">
            <Button
              onClick={onClose}
              type="button"
              variant="outline"
              disabled={lockAfterSuccess}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || lockAfterSuccess}>
              {loading
                ? mode === "edit"
                  ? "Actualizando..."
                  : "Guardando..."
                : mode === "edit"
                ? "Actualizar"
                : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

 