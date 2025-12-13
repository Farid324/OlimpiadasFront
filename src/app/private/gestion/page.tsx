// src/app/private/gestion/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { usePageHeader } from "@/contexts/pageHeader";
import dynamic from "next/dynamic";
import { Users, GraduationCap, Layers, AlertCircle, X } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import ModalPortal from "@/components/ui/ModalPortal";
import type { Gestion } from "@/libs/gestiones.api";
import {
  fetchCurrentGestion,
  fetchCanCloseGestion,
  closeGestion,
  openGestion,
} from "@/libs/gestiones.api";

const OlimpistasTab = dynamic(
  () => import("@/app/private/gestion/tabs/OlimpistasTab"),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-gray-400">
        Cargando módulo de Olimpistas...
      </div>
    ),
  }
);
const EquipoTab = dynamic(
  () => import("@/app/private/gestion/tabs/EquipoTab"),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-gray-400">
        Cargando módulo de Equipo...
      </div>
    ),
  }
);
const AreasGestionTab = dynamic(
  () => import("@/app/private/gestion/tabs/AreasGestionTab"),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-gray-400">
        Cargando módulo de Áreas...
      </div>
    ),
  }
);

type TabKey = "Olimpistas" | "Equipo" | "Areas";

const TAB_CONTENT = {
  Olimpistas: {
    title: "Directorio de Olimpistas",
    subtitle:
      "Gestión, inscripción y seguimiento de estudiantes participantes.",
  },
  Equipo: {
    title: "Equipo Académico",
    subtitle: "Administración de Evaluadores y Responsables de Área.",
  },
  Areas: {
    title: "Gestión Operativa de Áreas",
    subtitle: "Supervisión y control de las áreas activas en la competencia.",
  },
};

type GestionFeedback = {
  type: "error" | "info";
  message: string;
} | null;

type BackendError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getBackendErrorMessage(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;

  const maybeError = error as BackendError;
  const message = maybeError.response?.data?.message;

  return typeof message === "string" ? message : null;
}

function GestionContent() {
  const { setTitle } = usePageHeader();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const activeTab: TabKey =
    tabParam === "Equipo" || tabParam === "Areas"
      ? (tabParam as TabKey)
      : "Olimpistas";

  const [gestionActual, setGestionActual] = useState<Gestion | null>(null);
  const [canClose, setCanClose] = useState(false);
  const [canCloseReason, setCanCloseReason] = useState<string | null>(null);
  const [loadingGestion, setLoadingGestion] = useState(true);
  const [closing, setClosing] = useState(false);

  const [showNewGestionModal, setShowNewGestionModal] = useState(false);
  const [nuevoAnio, setNuevoAnio] = useState<string>("");
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const [gestionFeedback, setGestionFeedback] = useState<GestionFeedback>(null);

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [pendingNewAnio, setPendingNewAnio] = useState<number | null>(null);
  const [pendingNewNombre, setPendingNewNombre] = useState<string>("");

  useEffect(() => {
    setTitle("Gestión Integral");
  }, [setTitle]);

  useEffect(() => {
    void reloadGestionState();
  }, []);

  async function reloadGestionState() {
    try {
      setLoadingGestion(true);
      setGestionFeedback(null);
      const [gestion, eligibility] = await Promise.all([
        fetchCurrentGestion(),
        fetchCanCloseGestion().catch(() => ({
          canClose: false,
          reason: "No fue posible verificar el estado de cierre.",
          gestionId: null,
        })),
      ]);
      setGestionActual(gestion);
      setCanClose(
        !!eligibility.canClose && !!gestion && gestion.estado === "ABIERTA"
      );
      setCanCloseReason(eligibility.reason ?? null);

      if (gestion) {
        setNuevoAnio(String(gestion.anio));
      } else {
        setNuevoAnio(String(new Date().getFullYear()));
      }
    } finally {
      setLoadingGestion(false);
    }
  }

  const handleTabChange = (tab: TabKey) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hayGestionAbierta =
    !!gestionActual && gestionActual.estado === "ABIERTA";

  // click en "Nueva gestión"
  function handleNuevaGestionClick() {
    setGestionFeedback(null);

    if (loadingGestion || creating) return;

    if (hayGestionAbierta) {
      setGestionFeedback({
        type: "error",
        message:
          "No es posible iniciar una nueva gestión mientras exista una gestión abierta. Cierra la gestión actual primero.",
      });
      return;
    }

    abrirModalNuevaGestion();
  }

  function handleCloseGestionClick() {
    setGestionFeedback(null);

    if (loadingGestion || closing) return;

    if (!gestionActual || gestionActual.estado !== "ABIERTA") {
      setGestionFeedback({
        type: "error",
        message: "No hay una gestión abierta para cerrar.",
      });
      return;
    }

    if (!canClose) {
      setGestionFeedback({
        type: "error",
        message:
          canCloseReason ??
          "No es posible cerrar la gestión: aún no hay cierres validados para ambas fases (clasificación y final).",
      });
      return;
    }

    setShowConfirmClose(true);
  }

  async function confirmarCierreGestion() {
    if (!gestionActual || gestionActual.estado !== "ABIERTA") {
      setShowConfirmClose(false);
      return;
    }

    try {
      setClosing(true);
      await closeGestion();
      setShowConfirmClose(false);
      await reloadGestionState();
      setGestionFeedback({
        type: "info",
        message: "Gestión cerrada correctamente.",
      });
    } catch (error: unknown) {
      setShowConfirmClose(false);
      const msg =
        getBackendErrorMessage(error) ??
        "No fue posible cerrar la gestión. Revisa las fases y vuelve a intentar.";
      setGestionFeedback({ type: "error", message: msg });
    } finally {
      setClosing(false);
    }
  }

  function abrirModalNuevaGestion() {
    setShowNewGestionModal(true);
  }

  function cerrarModalNuevaGestion() {
    if (creating) return;
    setShowNewGestionModal(false);
  }

  function handleCrearGestion(e: React.FormEvent) {
    e.preventDefault();

    const anioNum = Number(nuevoAnio);
    if (!anioNum || Number.isNaN(anioNum)) {
      setGestionFeedback({
        type: "error",
        message: "Debes indicar un año válido.",
      });
      return;
    }

    setPendingNewAnio(anioNum);
    setPendingNewNombre(nuevoNombre.trim());
    setShowConfirmNew(true);
  }

  // ejecuta la creación real después de confirmar en el modal
  async function confirmarCrearGestion() {
    if (pendingNewAnio == null) {
      setShowConfirmNew(false);
      return;
    }

    try {
      setCreating(true);
      await openGestion({
        anio: pendingNewAnio,
        nombre: pendingNewNombre || undefined,
      });
      setShowConfirmNew(false);
      setShowNewGestionModal(false);
      await reloadGestionState();
      setGestionFeedback({
        type: "info",
        message: "Nueva gestión iniciada correctamente.",
      });
    } catch (error: unknown) {
      setShowConfirmNew(false);
      const msg =
        getBackendErrorMessage(error) ??
        "No fue posible iniciar la nueva gestión. Verifica que no haya otra gestión abierta.";
      setGestionFeedback({ type: "error", message: msg });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-1 space-y-6 text-gray-900">
      <div className=" min-h-[600px] p-1 flex flex-col gap-6">
        {/* Encabezado + acciones de gestión */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {TAB_CONTENT[activeTab].title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {TAB_CONTENT[activeTab].subtitle}
            </p>

            <div className="mt-3 text-xs text-gray-500">
              {loadingGestion ? (
                <span>Cargando gestión…</span>
              ) : gestionActual ? (
                <span>
                  Gestión actual:{" "}
                  <strong>
                    {gestionActual.anio}
                    {gestionActual.nombre ? ` – ${gestionActual.nombre}` : ""}
                  </strong>{" "}
                  ({gestionActual.estado === "ABIERTA" ? "Abierta" : "Cerrada"})
                </span>
              ) : (
                <span>No hay gestión abierta actualmente.</span>
              )}
            </div>
          </div>

          {/* Bloque de botones + mensaje de feedback visual */}
          <div className="flex flex-col gap-2 items-stretch md:items-end">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingGestion || creating}
                onClick={handleNuevaGestionClick}
              >
                Nueva gestión
              </Button>

              <Button
                variant="destructive"
                size="sm"
                disabled={loadingGestion || closing}
                onClick={handleCloseGestionClick}
              >
                {closing ? "Cerrando…" : "Cerrar gestión"}
              </Button>
            </div>

            {gestionFeedback && (
              <div
                className={`mt-1 max-w-xs sm:max-w-md text-xs sm:text-sm px-3 py-2 rounded-lg border flex items-start gap-2
                  ${
                    gestionFeedback.type === "error"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-green-50 border-green-200 text-green-800"
                  }`}
              >
                <AlertCircle className="w-4 h-4 mt-[2px]" />
                <span>{gestionFeedback.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex md:justify-start overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-full shadow-inner whitespace-nowrap">
            <button
              onClick={() => handleTabChange("Olimpistas")}
              className={`flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === "Olimpistas"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Olimpistas</span>
            </button>

            <button
              onClick={() => handleTabChange("Equipo")}
              className={`flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === "Equipo"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Equipo Académico</span>
            </button>

            <button
              onClick={() => handleTabChange("Areas")}
              className={`flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === "Areas"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Áreas</span>
            </button>
          </div>
        </div>

        {/* Contenido del Tab */}
        <div className="flex-1 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "Olimpistas" && <OlimpistasTab />}
          {activeTab === "Equipo" && <EquipoTab />}
          {activeTab === "Areas" && <AreasGestionTab />}
        </div>
      </div>

      {/* Modal Nueva Gestión (formulario) */}
      {showNewGestionModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Iniciar nueva gestión
                </h3>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={cerrarModalNuevaGestion}
                  disabled={creating}
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Para iniciar una nueva gestión, indica el año y, opcionalmente,
                un nombre descriptivo. Solo puede haber una gestión abierta a la
                vez.
              </p>

              <form className="space-y-4" onSubmit={handleCrearGestion}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año de la gestión
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    value={nuevoAnio}
                    onChange={(e) => setNuevoAnio(e.target.value)}
                    min={2000}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre (opcional)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    placeholder="Ej. Olimpiadas Nacionales 2025 – 1ra edición"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cerrarModalNuevaGestion}
                    disabled={creating}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? "Validando…" : "Iniciar gestión"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal de confirmación: Cerrar gestión */}
      {showConfirmClose && gestionActual && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow w-full max-w-md">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-900">
                    Cerrar gestión
                  </h3>
                </div>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => setShowConfirmClose(false)}
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="px-4 py-4 text-sm text-gray-700">
                ¿Seguro que deseas cerrar la gestión{" "}
                <span className="font-semibold">
                  {gestionActual.anio}
                  {gestionActual.nombre ? ` – ${gestionActual.nombre}` : ""}
                </span>
                ? Esta acción no se puede deshacer desde la interfaz.
              </div>

              <div className="px-4 py-3 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmClose(false)}
                  disabled={closing}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={confirmarCierreGestion}
                  disabled={closing}
                >
                  {closing ? "Cerrando…" : "Aceptar"}
                </Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal de confirmación: Nueva gestión */}
      {showConfirmNew && pendingNewAnio != null && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow w-full max-w-md">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">
                    Confirmar nueva gestión
                  </h3>
                </div>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => setShowConfirmNew(false)}
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="px-4 py-4 text-sm text-gray-700">
                Vas a iniciar la gestión{" "}
                <span className="font-semibold">
                  {pendingNewAnio}
                  {pendingNewNombre ? ` – ${pendingNewNombre}` : ""}
                </span>
                . Solo puede haber una gestión abierta a la vez. ¿Deseas
                continuar?
              </div>

              <div className="px-4 py-3 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmNew(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={confirmarCrearGestion}
                  disabled={creating}
                >
                  {creating ? "Creando…" : "Aceptar"}
                </Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

export default function GestionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[600px] text-gray-500">
          Cargando panel de gestión...
        </div>
      }
    >
      <GestionContent />
    </Suspense>
  );
}
