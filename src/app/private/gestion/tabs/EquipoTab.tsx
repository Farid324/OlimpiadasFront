//src/app/private/gestion/tabs/EquipoTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  type ResponsableEquipo,
  type EvaluadorEquipo,
  fetchAllGestiones,
  fetchEquipoByGestion,
  type Gestion,
} from "@/libs/gestiones.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

type GestionKey = "ALL" | string;

type EquipoPorGestion = {
  gestion: Gestion;
  responsables: ResponsableEquipo[];
  evaluadores: EvaluadorEquipo[];
};

function getInitials(nombre: string, apellido: string): string {
  const n = (nombre ?? "").trim();
  const a = (apellido ?? "").trim();
  const ini = `${n.charAt(0) ?? ""}${a.charAt(0) ?? ""}`.toUpperCase();
  return ini || "NA";
}

function formatGestionLabel(g: Gestion): string {
  const nombre = g.nombre ? ` – ${g.nombre}` : "";
  const tag = g.estado === "ABIERTA" ? " (Activa)" : "";
  return `${g.anio}${nombre}${tag}`;
}

function toGestionKey(idGestion: number): GestionKey {
  return String(idGestion);
}

function isGestionActiva(g: Gestion): boolean {
  return g.estado === "ABIERTA";
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "red" | "gray";
}) {
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-700"
      : tone === "red"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default function EquipoTab() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [selectedGestionKey, setSelectedGestionKey] = useState<GestionKey>("ALL");

  const [equipos, setEquipos] = useState<EquipoPorGestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar gestiones (para el combo)
  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const g = await fetchAllGestiones();
        if (!mounted) return;

        setGestiones(g);

        // Default: "Todas las Gestiones"
        setSelectedGestionKey("ALL");
      } catch {
        if (!mounted) return;
        setError("No fue posible cargar las gestiones.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Cargar equipo según selección (ALL o una gestión)
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (gestiones.length === 0) return;

      setLoading(true);
      setError(null);
      setEquipos([]);

      try {
        if (selectedGestionKey === "ALL") {
          const requests = gestiones.map(async (g) => {
            const res = await fetchEquipoByGestion(g.id_gestion);
            // Normalizar: el backend puede devolver gestion null si algo raro pasa
            if (!res?.gestion) {
              throw new Error("Respuesta inválida (gestion null).");
            }
            return {
              gestion: res.gestion,
              responsables: res.responsables ?? [],
              evaluadores: res.evaluadores ?? [],
            } satisfies EquipoPorGestion;
          });

          const settled = await Promise.allSettled(requests);

          const ok: EquipoPorGestion[] = [];
          for (const s of settled) {
            if (s.status === "fulfilled") ok.push(s.value);
          }

          // Mantener orden como el combo (gestiones ya viene ordenada del BE)
          const byId = new Map<number, EquipoPorGestion>(
            ok.map((x) => [x.gestion.id_gestion, x])
          );
          const ordered = gestiones
            .map((g) => byId.get(g.id_gestion))
            .filter((x): x is EquipoPorGestion => !!x);

          if (!mounted) return;

          if (ordered.length === 0) {
            setError("No fue posible cargar el equipo académico.");
            setEquipos([]);
            return;
          }

          // Si hubo fallas parciales, no cortamos la vista.
          setEquipos(ordered);
          return;
        }

        const idGestion = Number(selectedGestionKey);
        const res = await fetchEquipoByGestion(idGestion);

        if (!mounted) return;

        if (!res?.gestion) {
          setEquipos([]);
          setError("No se encontró información para la gestión seleccionada.");
          return;
        }

        setEquipos([
          {
            gestion: res.gestion,
            responsables: res.responsables ?? [],
            evaluadores: res.evaluadores ?? [],
          },
        ]);
      } catch {
        if (!mounted) return;
        setError("No fue posible cargar el equipo académico.");
        setEquipos([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [selectedGestionKey, gestiones]);

  // Datos visibles (unificados) para métricas
  const visibles = useMemo(() => {
    const responsablesAll: ResponsableEquipo[] = [];
    const evaluadoresAll: EvaluadorEquipo[] = [];
    for (const b of equipos) {
      responsablesAll.push(...(b.responsables ?? []));
      evaluadoresAll.push(...(b.evaluadores ?? []));
    }
    return { responsablesAll, evaluadoresAll };
  }, [equipos]);

  const metrics = useMemo(() => {
    const totalResponsables = visibles.responsablesAll.length;
    const totalEvaluadores = visibles.evaluadoresAll.length;

    const areasSet = new Set<string>();
    visibles.responsablesAll.forEach((r) => areasSet.add(r.area.nombre_area));
    visibles.evaluadoresAll.forEach((e) => {
      (e.evaluadores_area ?? []).forEach(({ area }) =>
        areasSet.add(area.nombre_area)
      );
    });

    return {
      totalResponsables,
      totalEvaluadores,
      totalAreasCubiertas: areasSet.size,
    };
  }, [visibles]);

  const hasData = equipos.length > 0;

  return (
    <div className="space-y-6">
      {/* Encabezado + botones */}
      <div className="bg-white flex flex-col p-4 gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
            Directorio de Personal
          </h3>
          <p className="text-xs text-gray-500">
            Responsables y evaluadores por gestión.
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
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Evaluadores
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtro por gestión */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-600">Gestión</p>
          <div className="max-w-xs">
            <Select
              value={selectedGestionKey}
              onValueChange={(v) => setSelectedGestionKey(v)}
              disabled={gestiones.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar gestión" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">Todas las Gestiones</SelectItem>
                {gestiones.map((g) => (
                  <SelectItem key={g.id_gestion} value={toGestionKey(g.id_gestion)}>
                    {formatGestionLabel(g)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CardMetric label="Responsables de área" value={metrics.totalResponsables} />
        <CardMetric label="Evaluadores" value={metrics.totalEvaluadores} />
        <CardMetric label="Áreas cubiertas" value={metrics.totalAreasCubiertas} />
      </div>

      {/* Estado */}
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

      {!loading && !error && !hasData && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          No se encontró información para la selección actual.
        </div>
      )}

      {/* Bloques por gestión */}
      {!loading && !error && hasData && (
        <div className="space-y-6">
          {equipos.map((block) => {
            const g = block.gestion;
            const activa = isGestionActiva(g);

            const responsables = block.responsables ?? [];
            const evaluadores = block.evaluadores ?? [];

            return (
              <div
                key={g.id_gestion}
                className="rounded-lg border border-gray-200 bg-white p-4 space-y-4"
              >
                {/* Header del bloque */}
                <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      Gestión {formatGestionLabel(g)}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {activa
                        ? "Gestión activa: el estado de cada persona refleja su registro actual."
                        : "Gestión cerrada: el equipo se muestra como histórico."}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {activa ? (
                      <StatusPill label="Activa" tone="green" />
                    ) : (
                      <StatusPill label="Cerrada" tone="gray" />
                    )}
                  </div>
                </div>

                {/* Contenido del bloque */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Responsables */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-gray-800">
                        Responsables de área ({responsables.length})
                      </h5>
                    </div>

                    {responsables.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                        No hay responsables registrados en esta gestión.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {responsables.map((r) => {
                          const initials = getInitials(
                            r.usuario.nombre,
                            r.usuario.apellido
                          );

                          // Regla solicitada:
                          // - Si la gestión NO está activa: siempre mostrar "Inactivo" (gris)
                          // - Si está activa: usar r.activo (verde / rojo)
                          const pill = !activa
                            ? { label: "Inactivo", tone: "gray" as const }
                            : r.activo
                            ? { label: "Activo", tone: "green" as const }
                            : { label: "Inactivo", tone: "red" as const };

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
                                  <h6 className="font-semibold text-gray-900 truncate">
                                    {r.usuario.nombre} {r.usuario.apellido}
                                  </h6>
                                  <StatusPill label={pill.label} tone={pill.tone} />
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

                  {/* Evaluadores */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-gray-800">
                        Evaluadores ({evaluadores.length})
                      </h5>
                    </div>

                    {evaluadores.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                        No hay evaluadores registrados en esta gestión.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {evaluadores.map((e) => {
                          const initials = getInitials(e.nombre, e.apellido);
                          const areas = e.evaluadores_area ?? [];
                          const displayAreas = areas.slice(0, 2);
                          const extraCount =
                            areas.length > 2 ? areas.length - displayAreas.length : 0;

                          const pill = !activa
                            ? { label: "Inactivo", tone: "gray" as const }
                            : e.activo
                            ? { label: "Activo", tone: "green" as const }
                            : { label: "Inactivo", tone: "red" as const };

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
                                  <h6 className="font-semibold text-gray-900 truncate">
                                    {e.nombre} {e.apellido}
                                  </h6>
                                  <StatusPill label={pill.label} tone={pill.tone} />
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
              </div>
            );
          })}
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
