// src/components/olimpistas/RegisterTutorModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTutor, searchTutores, getTutor } from "@/libs/tutores.api";
import type { CreateTutorInput, Tutor } from "@/types/tutor";
import { Search } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";

/* ===================== Schema (mensajes específicos) ===================== */
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

  // CI opcional: vacío permitido; si viene, 5-12 dígitos
  ci: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^\d{5,12}$/.test(v),
      "El CI debe tener 5 a 12 dígitos."
    ),

  // Correo opcional: vacío permitido; si viene, formato válido
  correo: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || z.string().email().safeParse(v).success,
      "Correo inválido"
    ),

  // Teléfono requerido: 7-12 dígitos (sin símbolos)
  telefono: z
    .string()
    .trim()
    .min(7, "El teléfono debe tener entre 7 y 12 dígitos.")
    .max(12, "El teléfono debe tener entre 7 y 12 dígitos.")
    .regex(/^\d+$/, "El teléfono solo admite números."),

  // Unidad Educativa opcional; vacío permitido
  unidadEducativa: z.string().trim().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function RegisterTutorModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (res: {
    telefono: string;
    tutorId: number;
    linked: number;
    tutorNombre: string;
  }) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Tutor[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [relacionados, setRelacionados] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  /* ===================== Búsqueda de tutores ===================== */
  useEffect(() => {
    const h = setTimeout(async () => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const data = await searchTutores(q.trim());
        setResults(data);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);
    return () => clearTimeout(h);
  }, [q]);

  /* ===================== Selección de un tutor ===================== */
  const pickTutor = async (t: Tutor) => {
    try {
      const det = await getTutor(t.id);
      setValue("nombreCompleto", det.nombreCompleto);
      setValue("ci", det.ci || "");
      setValue("correo", det.correo || "");
      setValue("telefono", det.telefono);
      setValue("unidadEducativa", det.unidadEducativa || "");
      setRelacionados(det.relacionados);
    } catch {
      setValue("nombreCompleto", t.nombreCompleto);
      setValue("ci", t.ci || "");
      setValue("correo", t.correo || "");
      setValue("telefono", t.telefono);
      setValue("unidadEducativa", t.unidadEducativa || "");
      setRelacionados(t.relacionados ?? null);
    }
  };

  /* ===================== Submit ===================== */
  const onSubmit: SubmitHandler<FormData> = async (f) => {
    setSubmitting(true);
    try {
      const payload: CreateTutorInput = {
        nombreCompleto: f.nombreCompleto.trim(),
        ci: f.ci?.trim() || undefined,
        correo: f.correo?.trim() || undefined,
        telefono: f.telefono.trim(),
        unidadEducativa: f.unidadEducativa?.trim() || undefined,
      };

      const res = await createTutor(payload);

      onSuccess({
        telefono: payload.telefono,
        tutorId: res.tutorId,
        linked: res.linked,
        tutorNombre: payload.nombreCompleto,
      });

      reset();
      onClose();
    } catch (e: unknown) {
      // Muestra errores "correspondientes":
      // si backend devuelve conflicto por CI/correo, puedes mapearlo aquí
      const msg =
        e instanceof Error ? e.message : "No se pudo registrar el tutor.";
      if (/ci/i.test(msg)) {
        setError("ci", { type: "manual", message: msg });
      } else if (/correo|email/i.test(msg)) {
        setError("correo", { type: "manual", message: msg });
      } else if (/tel|fono/i.test(msg)) {
        setError("telefono", { type: "manual", message: msg });
      } else {
        // error general (opcional: podrías renderizarlo en un banner)
        console.error(e);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-2"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-[720px] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Cerrar"
          >
            ✕
          </button>

          <h2 className="text-lg font-bold text-black">
            Registrar Tutor académico
          </h2>
          <p className="text-gray-500 mb-3">
            Complete la información del tutor
          </p>

          {/* Buscador */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={18}
            />
            <input
              className="w-full pl-10 h-10 border rounded-md text-black"
              placeholder="Buscar por nombre, email o CI"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {loadingSearch && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-black italic">
                buscando…
              </span>
            )}

            {/* Resultados rápidos */}
            {results.length > 0 && (
              <div className="absolute z-[1001] mt-2 w-full bg-white border rounded-md max-h-60 overflow-y-auto">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={async () => {
                        await pickTutor(r);
                        setResults([]);
                        setQ("");
                      }}
                      className="text-left"
                    >
                      <div className="font-medium text-black">
                        {r.nombreCompleto}
                      </div>
                      <div className="text-xs text-gray-500">
                        CI: {r.ci || "-"} · Tel: {r.telefono} ·{" "}
                        {r.correo || "-"}
                      </div>
                    </button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onSuccess({
                          telefono: r.telefono,
                          tutorId: r.id,
                          linked: r.relacionados ?? 0,
                          tutorNombre: r.nombreCompleto,
                        });
                        onClose();
                      }}
                    >
                      Usar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nombre completo del tutor"
                  className="text-gray-700"
                  aria-invalid={!!errors.nombreCompleto}
                  {...register("nombreCompleto")}
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
                  Cédula de identidad
                </label>
                <Input
                  placeholder="00000000"
                  className="text-gray-700"
                  aria-invalid={!!errors.ci}
                  {...register("ci")}
                />
                {errors.ci && (
                  <p className="text-red-500 text-sm">{errors.ci.message}</p>
                )}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <Input
                  placeholder="correo@ejemplo.com"
                  className="text-gray-700"
                  aria-invalid={!!errors.correo}
                  {...register("correo")}
                />
                {errors.correo && (
                  <p className="text-red-500 text-sm">
                    {errors.correo.message}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="7xxxxxxx"
                  className="text-gray-700"
                  aria-invalid={!!errors.telefono}
                  {...register("telefono")}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm">
                    {errors.telefono.message}
                  </p>
                )}
              </div>

              {/* Unidad Educativa */}
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Unidad Educativa
                </label>
                <Input
                  placeholder="U.E. ..."
                  className="text-gray-700"
                  aria-invalid={!!errors.unidadEducativa}
                  {...register("unidadEducativa")}
                />
              </div>
            </div>

            {relacionados !== null && (
              <p className="text-sm text-gray-600 -mt-1">
                Olimpista(s) relacionado(s):{" "}
                <span className="font-semibold">{relacionados}</span>
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando…" : "Registrar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
