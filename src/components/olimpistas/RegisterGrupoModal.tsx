//src/components/olimpistas/RegisterGrupoModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AddMiembroGrupoModal from "./AddMiembroGrupoModal";
import { DEPARTAMENTOS, NIVELES_COMPETENCIA } from "@/config/catalogs";
import { api } from "@/libs/api";
import { registerGrupo } from "@/libs/grupos.api";
import type { GrupoMiembroInput } from "@/types/grupo";
import RegisterTutorModal from "./RegisterTutorModal";
import { VM } from "@/config/validation-messages";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

type Area = { id_area: number; nombre_area: string };
type NivelCompetencia = "Primaria" | "Secundaria";

// ====== Schema Zod para datos básicos del grupo ======
const grupoSchema = z.object({
  nombreEquipo: z
    .string()
    .trim()
    .min(2, "El nombre del equipo es obligatorio")
    .max(80, VM.max80)
    .regex(/^[\p{L}\s.'-]+$/u, VM.onlyLetters),
  unidadEducativa: z
    .string()
    .trim()
    .min(2, VM.ueMin)
    .max(80, VM.max80)
    .regex(/^[\p{L}\s.'-]+$/u, VM.onlyLetters),
  departamento: z.enum(DEPARTAMENTOS, { message: VM.deptRequired }),
});

type GrupoErrors = {
  nombreEquipo?: string;
  unidadEducativa?: string;
  departamento?: string;
};

export default function RegisterGrupoModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [unidadEducativa, setUnidadEducativa] = useState("");
  const [departamento, setDepartamento] = useState<string>("La Paz");
  const [nivelCompetencia, setNivelCompetencia] =
    useState<NivelCompetencia>("Secundaria");
  const [areaNombre, setAreaNombre] = useState<string>("");

  const [miembros, setMiembros] = useState<GrupoMiembroInput[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showTutorModal, setShowTutorModal] = useState(false);
  const [tutorSeleccionado, setTutorSeleccionado] = useState<{
    id?: number;
    nombre?: string;
    telefono?: string;
  } | null>(null);

  const [errors, setErrors] = useState<GrupoErrors>({});
  const [membersError, setMembersError] = useState<string | null>(null);
  const [tutorError, setTutorError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Area[]>("/areas");
        setAreas(data);
        if (data.length) setAreaNombre(data[0].nombre_area);
      } catch {}
    })();
  }, []);

  const addMiembro = (m: GrupoMiembroInput) =>
    setMiembros((prev) => {
      const updated = [...prev, m];
      if (updated.length >= 1) {
        setMembersError(null);
      }
      return updated;
    });

  const removeMiembro = (ci: string) =>
    setMiembros((prev) => prev.filter((x) => x.ci !== ci));

  const submit = async () => {
    // 1) Validar datos básicos con Zod
    const result = grupoSchema.safeParse({
      nombreEquipo,
      unidadEducativa,
      departamento,
    });

    let hasError = false;
    let parsed: z.infer<typeof grupoSchema> | null = null;

    if (!result.success) {
      const fieldErrors: GrupoErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof GrupoErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      hasError = true;
    } else {
      setErrors({});
      parsed = result.data;
    }

    // 2) Validar miembros
    if (miembros.length < 2) {
      if (miembros.length === 0) {
        setMembersError(
          "Agregue al menos 2 olimpistas para registrar un grupo."
        );
      } else {
        setMembersError(null); // para el caso de 1 miembro se muestra VM.minGroupMembers
      }
      hasError = true;
    } else {
      setMembersError(null);
    }

    // 3) Validar tutor
    if (!tutorSeleccionado) {
      setTutorError(
        "Debe registrar o seleccionar un tutor responsable para el grupo."
      );
      hasError = true;
    } else {
      setTutorError(null);
    }

    // Si hay errores o no hay parsed, no llamamos al backend
    if (hasError || !parsed) return;

    // 4) Todo OK, registrar grupo
    setLoading(true);
    setSuccessMsg(null);
    try {
      await registerGrupo({
        nombreEquipo: parsed.nombreEquipo.trim().replace(/\s+/g, " "),
        unidadEducativa: parsed.unidadEducativa.trim().replace(/\s+/g, " "),
        departamento: parsed.departamento,
        area: areaNombre,
        nivel: nivelCompetencia,
        miembros,
        tutorId: tutorSeleccionado?.id,
        tutorTelefono: tutorSeleccionado?.telefono,
      });

      // Banner de éxito
      setSuccessMsg("Grupo registrado con éxito");
      onSuccess();

      // Cerrar un poco después para que se alcance a ver el mensaje
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (e) {
      console.error("Error al registrar grupo", e);
    } finally {
      setLoading(false);
    }
  };

  // pill reutilizable con estilo negro cuando está activo
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
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm font-semibold border transition-colors ${
        active
          ? "bg-black text-white border-black"
          : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-[780px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-black">
          Registrar Nuevo Grupo Olimpista
        </h2>
        <p className="text-gray-500 mb-4">Complete la información del Grupo</p>

        {/* Banner de confirmación */}
        {successMsg && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        {/*FormularioPrincipal*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nombre del Equipo
            </label>
            <Input
              value={nombreEquipo}
              onChange={(e) =>
                setNombreEquipo(
                  e.target.value
                    .replace(/[^ \p{L}.'-]/gu, "")
                    .replace(/\s+/g, " ")
                    .trimStart()
                )
              }
              className="text-gray-700"
              placeholder="Team Robotics"
            />
            {errors.nombreEquipo && (
              <p className="text-red-600 text-sm mt-1">{errors.nombreEquipo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Unidad Educativa
            </label>
            <Input
              value={unidadEducativa}
              onChange={(e) =>
                setUnidadEducativa(
                  e.target.value
                    .replace(/[^ \p{L}.'-]/gu, "")
                    .replace(/\s+/g, " ")
                    .trimStart()
                )
              }
              className="text-gray-700"
              placeholder="U.E. Santa María"
            />
            {errors.unidadEducativa && (
              <p className="text-red-600 text-sm mt-1">
                {errors.unidadEducativa}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Departamento de procedencia
            </label>
            <select
              className="border rounded-md p-2 w-full text-gray-700"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
            >
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.departamento && (
              <p className="text-red-600 text-sm mt-1">{errors.departamento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nivel de competencia
            </label>
            <div className="flex gap-2">
              {NIVELES_COMPETENCIA.map((n) => (
                <Pill
                  key={n}
                  active={nivelCompetencia === n}
                  onClick={() => setNivelCompetencia(n as NivelCompetencia)}
                >
                  {n}
                </Pill>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Áreas de competencia
            </label>
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <Pill
                  key={a.id_area}
                  active={areaNombre === a.nombre_area}
                  onClick={() => setAreaNombre(a.nombre_area)}
                >
                  {a.nombre_area}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        {/*tutor responsable GR*/}
        <div className="border rounded-lg mb-4 p-4">
          <h3 className="font-semibold text-gray-700 mb-2">
            Tutor académico responsable
          </h3>
          {tutorSeleccionado ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-800 font-medium">
                  {tutorSeleccionado.nombre}
                </p>
                <p className="text-sm text-gray-500">
                  Teléfono: {tutorSeleccionado.telefono}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setTutorSeleccionado(null)}
              >
                Eliminar tutor
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                setTutorError(null);
                setShowTutorModal(true);
              }}
            >
              Registrar / Seleccionar tutor
            </Button>
          )}
          {tutorError && (
            <p className="mt-2 text-sm text-red-600">{tutorError}</p>
          )}
        </div>

        {/*miembros*/}
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-3">
            <h3 className="font-semibold text-gray-700">Miembros del equipo</h3>
            <Button onClick={() => setShowAdd(true)}>Agregar olimpista</Button>
          </div>

          <div className="px-3 pb-3">
            {miembros.length === 0 ? (
              <div
                className={`text-sm border rounded-md p-3 text-center ${
                  membersError
                    ? "text-red-600 border-red-300 bg-red-50"
                    : "text-gray-500"
                }`}
              >
                {membersError
                  ? "Agregue al menos 2 olimpistas para registrar un grupo."
                  : "Aún no añadiste miembros."}
              </div>
            ) : (
              <>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-700 border-b">
                      <th className="text-left py-2 px-2">Nombre</th>
                      <th className="text-left py-2 px-2">CI</th>
                      <th className="text-left py-2 px-2">
                        Grado de escolaridad
                      </th>
                      <th className="text-left py-2 px-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {miembros.map((m) => (
                      <tr key={m.ci} className="border-b">
                        <td className="py-2 px-2 text-gray-700">
                          {m.nombreCompleto}
                        </td>
                        <td className="py-2 px-2 text-gray-700">{m.ci}</td>
                        <td className="py-2 px-2 text-gray-700">
                          {m.grado}ro. {nivelCompetencia}
                        </td>
                        <td className="py-2 px-2">
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => removeMiembro(m.ci)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mensaje cuando hay 1 miembro (o en general <2) */}
                {miembros.length > 0 && miembros.length < 2 && (
                  <p className="mt-2 text-sm text-red-600">
                    {VM.minGroupMembers}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Guardando..." : "Registrar"}
          </Button>
        </div>

        {showAdd && (
          <AddMiembroGrupoModal
            onClose={() => setShowAdd(false)}
            onAdd={addMiembro}
          />
        )}

        {showTutorModal && (
          <RegisterTutorModal
            onClose={() => setShowTutorModal(false)}
            onSuccess={({ telefono, tutorId, tutorNombre }) => {
              setTutorSeleccionado({
                id: tutorId,
                telefono,
                nombre: tutorNombre,
              });
              setTutorError(null);
              setShowTutorModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
