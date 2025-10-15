// src/components/olimpistas/RegisterGrupoModal.tsx

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

type Area = { id_area: number; nombre_area: string };
type NivelCompetencia = "Primaria" | "Secundaria";

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
  const [success, setSuccess] = useState<string | null>(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [tutorSeleccionado, setTutorSeleccionado] = useState<{
    id?: number;
    nombre?: string;
    telefono?: string;
  } | null>(null);

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
    setMiembros((prev) => [...prev, m]);
  const removeMiembro = (ci: string) =>
    setMiembros((prev) => prev.filter((x) => x.ci !== ci));

  const canSubmit =
    nombreEquipo &&
    unidadEducativa &&
    departamento &&
    areaNombre &&
    nivelCompetencia &&
    miembros.length > 0;
  tutorSeleccionado;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await registerGrupo({
        nombreEquipo,
        unidadEducativa,
        departamento,
        area: areaNombre,
        nivel: nivelCompetencia,
        miembros,
        tutorId: tutorSeleccionado?.id,
        tutorTelefono: tutorSeleccionado?.telefono,
      });
      setSuccess("Grupo registrado correctamente");
      onSuccess();
      setTimeout(onClose, 900);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // pill reutilizable
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
      className={`px-3 py-1 rounded-md text-sm font-semibold border ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-[780px] relative">
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

        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

        {/*FormularioPrincipal*/}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nombre del Equipo
            </label>
            <Input
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              className=" text-gray-700"
              placeholder="Team Robotics"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Unidad Educativa
            </label>
            <Input
              value={unidadEducativa}
              onChange={(e) => setUnidadEducativa(e.target.value)}
              className=" text-gray-700"
              placeholder="U.E. Santa María"
            />
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
            <Button onClick={() => setShowTutorModal(true)}>
              Registrar / Seleccionar tutor
            </Button>
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
              <div className="text-sm text-gray-500 border rounded-md p-3 text-center">
                Aún no añadiste miembros.
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!canSubmit || loading}>
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
              setShowTutorModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
