//src/components/olimpistas/RegisterTutorModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTutor, searchTutores, getTutor } from "@/libs/tutores.api";
import type { CreateTutorInput, Tutor } from "@/types/tutor";
import { Search } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";

const schema = z.object({
  nombreCompleto: z.string().min(1, "Requerido"),
  ci: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d{5,12}$/.test(v), "CI inválido"),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  telefono: z.string().min(7).max(12).regex(/^\d+$/, "Solo números"),
  unidadEducativa: z.string().optional().or(z.literal("")),
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

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
      setRelacionados(t.relacionados);
    }
  };

  const onSubmit = async (f: FormData) => {
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
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      {}
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
        onClick={onClose} // cerrar al clickear fuera
      >
        {}
        <div
          className="bg-white p-6 rounded-xl w-[720px] relative"
          onClick={(e) => e.stopPropagation()} // no cerrar al clickear dentro
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>

          <h2 className="text-lg font-bold text-black">
            Registrar Tutor académico
          </h2>
          <p className="text-gray-500 mb-3">
            Complete la información del tutor
          </p>

          {}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={18}
            />
            <input
              className="w-full pl-10 h-10 border rounded-md"
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

          {/* Formulario*/}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <Input
                  placeholder="Nombre completo del tutor"
                  className="text-gray-700"
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
                <Input
                  placeholder="00000000"
                  className="text-gray-700"
                  {...register("ci")}
                />
                {errors.ci && (
                  <p className="text-red-500 text-sm">{errors.ci.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <Input
                  placeholder="correo@ejemplo.com"
                  className="text-gray-700"
                  {...register("correo")}
                />
                {errors.correo && (
                  <p className="text-red-500 text-sm">
                    {errors.correo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input
                  placeholder="7xxxxxxx"
                  className="text-gray-700"
                  {...register("telefono")}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm">
                    {errors.telefono.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Unidad Educativa
                </label>
                <Input
                  placeholder="U.E. ..."
                  className="text-gray-700"
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
