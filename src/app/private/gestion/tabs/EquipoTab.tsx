//src/app/private/gestion/tabs/EquipoTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  fetchEquipoGestionActual,
  type EquipoGestionActualResponse,
  type ResponsableEquipo,
  type EvaluadorEquipo,
} from "@/libs/gestiones.api";

function getInitials(nombre: string, apellido: string): string {
  const n = (nombre ?? "").trim();
  const a = (apellido ?? "").trim();
  const ini = `${n.charAt(0) ?? ""}${a.charAt(0) ?? ""}`.toUpperCase();
  return ini || "NA";
}

export default function EquipoTab() {
  const [data, setData] = useState<EquipoGestionActualResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    void fetchEquipoGestionActual()
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch(() => {
        if (!mounted) return;
        setError("No fue posible cargar el equipo académico.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const responsables = useMemo<ResponsableEquipo[]>(() => {
    return data?.responsables ?? [];
  }, [data]);

  const evaluadores = useMemo<EvaluadorEquipo[]>(() => {
    return data?.evaluadores ?? [];
  }, [data]);

  const metrics = useMemo(() => {
    const totalResponsables = responsables.length;
    const totalEvaluadores = evaluadores.length;

    const areasSet = new Set<string>();
    responsables.forEach((r) => areasSet.add(r.area.nombre_area));
    evaluadores.forEach((e) => {
      e.evaluadores_area.forEach(({ area }) => areasSet.add(area.nombre_area));
    });

    const totalAreasCubiertas = areasSet.size;

    return {
      totalResponsables,
      totalEvaluadores,
      totalAreasCubiertas,
    };
  }, [responsables, evaluadores]);

  const hayGestionAbierta = !!data?.gestion;

  return (
    <div className="space-y-6">
      {/* Encabezado + botones de navegación a módulos de detalle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
            Directorio de Personal
          </h3>
          <p className="text-xs text-gray-500">
            Visión consolidada de responsables y evaluadores de la gestión
            actual.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
          <Link href="/private/responsables">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Responsables
            </Button>
          </Link>
          <Link href="/private/evaluadores">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Evaluadores
            </Button>
          </Link>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CardMetric
          label="Responsables de área"
          value={metrics.totalResponsables}
        />
        <CardMetric
          label="Evaluadores activos"
          value={metrics.totalEvaluadores}
        />
        <CardMetric
          label="Áreas cubiertas"
          value={metrics.totalAreasCubiertas}
        />
      </div>

      {/* Estado de carga / error */}
      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Cargando equipo académico…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !hayGestionAbierta && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          No hay una gestión abierta actualmente. El equipo académico se
          mostrará aquí cuando exista una gestión en estado ABierta y se hayan
          registrado responsables y evaluadores.
        </div>
      )}

      {/* Listados */}
      {!loading && !error && hayGestionAbierta && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Responsables */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">
                Responsables de área ({responsables.length})
              </h4>
              <span className="text-xs text-gray-500">
                Gestión {data?.gestion?.anio}
              </span>
            </div>

            {responsables.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                No hay responsables registrados en la gestión actual.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {responsables.map((r) => {
                  const initials = getInitials(
                    r.usuario.nombre,
                    r.usuario.apellido
                  );
                  return (
                    <div
                      key={r.id_responsable_area}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition bg-white flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-gray-900 truncate">
                            {r.usuario.nombre} {r.usuario.apellido}
                          </h5>
                          {r.activo ? (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700 font-semibold">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-100 text-red-700 font-semibold">
                              Inactivo
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-blue-700 font-medium mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Responsable de área
                        </p>

                        <p className="text-xs text-gray-600 mb-1">
                          Área:{" "}
                          <span className="font-semibold">
                            {r.area.nombre_area}
                          </span>
                        </p>

                        {r.usuario.institucion && (
                          <p className="text-xs text-gray-500 truncate">
                            {r.usuario.institucion}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Columna Evaluadores */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">
                Evaluadores ({evaluadores.length})
              </h4>
              <span className="text-xs text-gray-500">
                Gestión {data?.gestion?.anio}
              </span>
            </div>

            {evaluadores.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                No hay evaluadores registrados en la gestión actual.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evaluadores.map((e) => {
                  const initials = getInitials(e.nombre, e.apellido);
                  const areas = e.evaluadores_area ?? [];
                  const displayAreas = areas.slice(0, 2);
                  const extraCount =
                    areas.length > 2 ? areas.length - displayAreas.length : 0;

                  return (
                    <div
                      key={e.id_usuario}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition bg-white flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-gray-900 truncate">
                            {e.nombre} {e.apellido}
                          </h5>
                          {e.activo ? (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700 font-semibold">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-100 text-red-700 font-semibold">
                              Inactivo
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-green-700 font-medium mb-1">
                          Evaluador
                        </p>

                        {displayAreas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {displayAreas.map(({ area }) => (
                              <span
                                key={area.id_area}
                                className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[10px] font-semibold"
                              >
                                {area.nombre_area}
                              </span>
                            ))}
                            {extraCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-semibold">
                                +{extraCount} más
                              </span>
                            )}
                          </div>
                        )}

                        {e.institucion && (
                          <p className="text-xs text-gray-500 truncate">
                            {e.institucion}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function CardMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow border border-gray-100 flex flex-col justify-between">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
