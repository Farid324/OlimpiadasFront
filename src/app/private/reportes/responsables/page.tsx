// src/app/private/reportes/responsables/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/libs/api';
import { usePageHeader } from '@/contexts/pageHeader';
import { Users, Trophy, Medal, Lock, LockOpen, CircleCheck } from 'lucide-react';

type Resumen = {
  clasificados: number;
  oro: number;
  plata: number;
  bronce: number;
  menciones: number;
  totalPremiados: number;
};

type Phase = 'CLASIF' | 'FINAL';

/* Carga perezosa del tab reutilizado de Clasificados (mismo que Admin) */
const ClasificadosTab = dynamic(() => import('../tabs/clasificados'), { ssr: false });

/* Helper para cargar las métricas del backend */
const getResumen = async (): Promise<Resumen> =>
  (await api.get<Resumen>('/reportes/clasificados/resumen')).data;

/** Card métrica individual */
const Card = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
    <div className="flex justify-between items-start">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="text-black text-2xl">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-black">{value}</p>
  </div>
);

/** Botonera de fases: Fase de Clasificación / Fase Final con candados. */
const pillBase =
  'px-3 py-1 text-sm rounded-full transition inline-flex items-center gap-2';

const PhaseTabs = ({
  active,
  onChange,
  finalLocked = true, // <- Si quieres habilitar Fase Final, pasa false desde el padre
}: {
  active: Phase;
  onChange: (p: Phase) => void;
  finalLocked?: boolean;
}) => (
  <div
    role="tablist"
    aria-label="Fases de reportes"
    className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1"
  >
    {/* Botón: Fase de Clasificación (activa y desbloqueada) */}
    <button
      type="button"
      role="tab"
      aria-selected={active === 'CLASIF'}
      className={`${pillBase} ${
        active === 'CLASIF'
          ? 'bg-white text-black shadow'
          : 'text-gray-600 hover:bg-white hover:text-black'
      }`}
      onClick={() => onChange('CLASIF')}
    >
      Fase de Clasificación <LockOpen className="w-4 h-4 text-green-600" />
    </button>

    {/* Botón: Fase Final (bloqueada por ahora) */}
    <button
      type="button"
      role="tab"
      aria-selected={active === 'FINAL'}
      aria-disabled={finalLocked}
      disabled={finalLocked}
      className={`${pillBase} ${
        finalLocked
          ? 'text-gray-600 cursor-not-allowed'
          : active === 'FINAL'
          ? 'bg-white text-black shadow'
          : 'text-gray-600 hover:bg-white hover:text-black'
      }`}
      onClick={() => !finalLocked && onChange('FINAL')}
      title={finalLocked ? 'Fase Final bloqueada' : 'Fase Final'}
    >
      Fase Final <Lock className="w-4 h-4 text-red-500" />
    </button>
  </div>
);

/** Banner de “Fase Aprobada” */
const ApprovedBanner = () => (
  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
    <div className="flex items-start gap-2">
      <CircleCheck className="h-4 w-4 text-black mt-[2px]" strokeWidth={2.25} />
      <div>
        <p className="text-[14px] font-semibold text-black leading-5">
          Fase Aprobada
        </p>
        <p className="text-[13px] text-gray-700 leading-5">
          La fase de clasificación ha sido aprobada. Todos los reportes están
          disponibles para descarga.
        </p>
      </div>
    </div>
  </div>
);

/** Titulo de sección alineada a la izquierda (titulo “Clasificados”). */
const SectionPillLeft = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-start">
    <div className="inline-flex h-8 w-[260px] items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-normal text-gray-800 shadow-sm">
      {children}
    </div>
  </div>
);

/* Página principal*/
export default function ReportesResponsablePage() {
  const { setTitle } = usePageHeader();
  useEffect(() => {
    setTitle('Reportes');
  }, [setTitle]);

  const [phase, setPhase] = useState<Phase>('CLASIF');

  /* ——— Métricas (cards) ——— */
  const [resumen, setResumen] = useState<Resumen | null>(null);
  useEffect(() => {
    getResumen()
      .then(setResumen)
      .catch(() =>
        setResumen({
          clasificados: 0,
          oro: 0,
          plata: 0,
          bronce: 0,
          menciones: 0,
          totalPremiados: 0,
        }),
      );
  }, []);

  const cards = useMemo(
    () => [
      { k: 'clasificados', label: 'Clasificados', value: resumen?.clasificados ?? 0, icon: <Users /> },
      { k: 'oro',          label: 'Oro',          value: resumen?.oro ?? 0,          icon: <Trophy /> },
      { k: 'plata',        label: 'Plata',        value: resumen?.plata ?? 0,        icon: <Medal /> },
      { k: 'bronce',       label: 'Bronce',       value: resumen?.bronce ?? 0,       icon: <Medal /> },
      { k: 'menciones',    label: 'Menciones',    value: resumen?.menciones ?? 0,    icon: <Medal /> },
      { k: 'total',        label: 'Total Premiados', value: resumen?.totalPremiados ?? 0, icon: <Users /> },
    ],
    [resumen],
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Sistema de Reportes</h1>
        <p className="text-gray-500 text-sm">
          Generación de listas y documentos para clasificados y premiados
        </p>
      </div>

      {/* ===== Botones de fase (píldoras con candados) ===== */}
      <PhaseTabs active={phase} onChange={setPhase} finalLocked />

      {phase === 'CLASIF' && <ApprovedBanner />}

      {/* ===== Grid de cards de métricas ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {cards.map((c) => (
          <Card
            key={c.k}
            label={c.label}
            value={c.value}
            icon={<div className="w-6 h-6">{c.icon}</div>}
          />
        ))}
      </div>

      {/* ===== Píldora/título de sección alineada a la izquierda ===== */}
      <SectionPillLeft>Clasificados</SectionPillLeft>

      {/* ===== Contenido compartido: tabla/lista de Clasificados ===== */}
      <ClasificadosTab />
    </div>
  );
}

