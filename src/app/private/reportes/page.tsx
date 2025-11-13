// src/app/private/reportes/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/libs/api";
import { usePageHeader } from "@/contexts/pageHeader";
import { Users, Trophy, Medal } from "lucide-react";
import RoleGate from "@/components/features/RoleGate";

/* =========================
   Tipos y helpers de datos
   ========================= */
type ReportResumenDTO = {
  clasificados: number;
  oro: number;
  plata: number;
  bronce: number;
  menciones: number;
  totalPremiados: number;
};

type PhaseType = "CLASIFICACION" | "FINAL";
type TabKey =
  | "Clasificados"
  | "Premiados"
  | "Certificados"
  | "Ceremonia"
  | "Publicación";

async function getResumenClasificados(): Promise<ReportResumenDTO> {
  const { data } = await api.get<ReportResumenDTO>(
    "/reportes/clasificados/resumen"
  );
  return data;
}

async function checkAvailability(
  type: PhaseType
): Promise<{ unlocked: boolean; message: string | null }> {
  const { data } = await api.get<{ unlocked: boolean; message: string | null }>(
    "/phases/availability",
    { params: { type } }
  );
  return data;
}

/* =========================
   UI: Card métrica
   ========================= */
function CardMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="text-black">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-black">{value}</p>
    </div>
  );
}

/* =========================
   UI: Chips de fase (candados)
   ========================= */
// function PhaseChips({
//   clasifUnlocked,
//   finalUnlocked,
//   onClickClasif,
//   onClickFinal,
// }: {
//   clasifUnlocked: boolean;
//   finalUnlocked: boolean;
//   onClickClasif?: () => void;
//   onClickFinal?: () => void;
// }) {
//   const Chip = ({
//     label,
//     unlocked,
//     onClick,
//   }: {
//     label: string;
//     unlocked: boolean;
//     onClick?: () => void;
//   }) => (
//     <button
//       type="button"
//       onClick={onClick}
//       className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border bg-white text-slate-700 border-slate-300"
//       aria-pressed={unlocked}
//     >
//       {unlocked ? (
//         <Unlock className="w-4 h-4 text-emerald-500" aria-hidden />
//       ) : (
//         <Lock className="w-4 h-4 text-slate-400" aria-hidden />
//       )}
//       <span className="font-medium">{label}</span>
//     </button>
//   );

//   return (
//     <div className="flex items-center gap-2">

//     </div>
//   );
// }

/* =========================
   UI: Segmented Tabs
   ========================= */
function SegmentedTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange?: (tab: TabKey) => void;
}) {
  const tabs: TabKey[] = [
    "Clasificados",
    "Premiados",
    "Certificados",
    "Ceremonia",
    "Publicación",
  ];
  return (
    <div
      role="tablist"
      aria-label="Secciones de reportes"
      className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1"
    >
      {tabs.map((t) => {
        const isActive = t === active;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              "px-3 py-1 text-sm rounded-full transition",
              isActive
                ? "bg-white text-black shadow"
                : "text-gray-600 hover:bg-white hover:text-black",
            ].join(" ")}
            onClick={() => onChange?.(t)}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

/* ==========================================
   Carga perezosa de pestañas (tipadas con prop)
   ========================================== */
type TabProps = { disabled?: boolean };

const ClasificadosTab = dynamic<TabProps>(() => import("./tabs/clasificados"), {
  ssr: false,
});
const PremiadosTab = dynamic<TabProps>(() => import("./tabs/premiados"), {
  ssr: false,
});
const CertificadosTab = dynamic<TabProps>(() => import("./tabs/certificados"), {
  ssr: false,
});
const CeremoniaTab = dynamic<TabProps>(() => import("./tabs/ceremonia"), {
  ssr: false,
});
const PublicacionTab = dynamic<TabProps>(() => import("./tabs/publicacion"), {
  ssr: false,
});

/* =========================
   Página
   ========================= */
export default function ReportesPage() {
  const { setTitle } = usePageHeader();
  useEffect(() => {
    setTitle("Reportes");
  }, [setTitle]);

  const [active, setActive] = useState<TabKey>("Clasificados");

  // Disponibilidad por fase
  const [clasifAvail, setClasifAvail] = useState<{
    unlocked: boolean;
    message: string | null;
  }>({
    unlocked: false,
    message: null,
  });
  const [finalAvail, setFinalAvail] = useState<{
    unlocked: boolean;
    message: string | null;
  }>({
    unlocked: false,
    message: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([
          checkAvailability("CLASIFICACION"),
          checkAvailability("FINAL"),
        ]);
        setClasifAvail(a);
        setFinalAvail(b);
      } catch {
        setClasifAvail({
          unlocked: false,
          message: "No fue posible verificar el estado de la fase.",
        });
        setFinalAvail({
          unlocked: false,
          message: "No fue posible verificar el estado de la fase.",
        });
      }
    })();
  }, []);

  // KPIs (si no hay BE, muestra 0 sin romper)
  const [resumen, setResumen] = useState<ReportResumenDTO | null>(null);
  useEffect(() => {
    getResumenClasificados()
      .then(setResumen)
      .catch(() =>
        setResumen({
          clasificados: 0,
          oro: 0,
          plata: 0,
          bronce: 0,
          menciones: 0,
          totalPremiados: 0,
        })
      );
  }, []);

  const cards = useMemo(
    () => [
      {
        key: "clasificados",
        label: "Clasificados",
        value: resumen?.clasificados ?? 0,
        icon: <Users className="w-6 h-6" />,
      },
      {
        key: "oro",
        label: "Oro",
        value: resumen?.oro ?? 0,
        icon: <Trophy className="w-6 h-6" />,
      },
      {
        key: "plata",
        label: "Plata",
        value: resumen?.plata ?? 0,
        icon: <Medal className="w-6 h-6" />,
      },
      {
        key: "bronce",
        label: "Bronce",
        value: resumen?.bronce ?? 0,
        icon: <Medal className="w-6 h-6" />,
      },
      {
        key: "menciones",
        label: "Menciones",
        value: resumen?.menciones ?? 0,
        icon: <Medal className="w-6 h-6" />,
      },
      {
        key: "total",
        label: "Total Premiados",
        value: resumen?.totalPremiados ?? 0,
        icon: <Users className="w-6 h-6" />,
      },
    ],
    [resumen]
  );

  // Fase que controla la pestaña activa y bloqueo
  const phaseOfTab: PhaseType =
    active === "Clasificados" ? "CLASIFICACION" : "FINAL";
  const locked =
    phaseOfTab === "CLASIFICACION"
      ? !clasifAvail.unlocked
      : finalAvail.unlocked;
  /*const lockMsg =
    phaseOfTab === "CLASIFICACION" ? clasifAvail.message : finalAvail.message;*/

  return (
    <RoleGate allow={["ADMINISTRADOR"]}>
      <div className="p-6 space-y-6">
        {/* Encabezado + Chips */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Sistema de Reportes
            </h1>
            <p className="text-gray-500 text-sm">
              Generación de listas y documentos para clasificados y premiados
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div>
          <SegmentedTabs active={active} onChange={setActive} />
        </div>

        {/* Banner de bloqueo (amarillo) */}
        {locked && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
            <strong>Fase Bloqueada.</strong>{" "}
            {phaseOfTab === "FINAL"
              ? "La fase final aún no ha sido aprobada. Los reportes se habilitarán una vez que des el aval correspondiente."
              : "La fase de clasificación aún no ha sido aprobada. Los reportes se habilitarán una vez que des el aval correspondiente."}
          </div>
        )}

        {/* Cards (visibles pero “congeladas” si está bloqueado) */}
        <div
          className={locked ? "opacity-50 pointer-events-none select-none" : ""}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {cards.map((c) => (
              <CardMetric
                key={c.key}
                label={c.label}
                value={c.value}
                icon={c.icon}
              />
            ))}
          </div>
        </div>

        {/* Contenido del tab (congelado si bloqueado) */}
        <div
          className={locked ? "opacity-50 pointer-events-none select-none" : ""}
        >
          {active === "Clasificados" && <ClasificadosTab disabled={locked} />}
          {active === "Premiados" && <PremiadosTab disabled={locked} />}
          {active === "Certificados" && <CertificadosTab disabled={locked} />}
          {active === "Ceremonia" && <CeremoniaTab disabled={locked} />}
          {active === "Publicación" && <PublicacionTab disabled={locked} />}
        </div>
      </div>
    </RoleGate>
  );
}
