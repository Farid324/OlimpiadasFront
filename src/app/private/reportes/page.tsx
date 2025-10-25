// src/app/private/reportes/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/libs/api';
import { usePageHeader } from '@/contexts/pageHeader';
import { Users, Trophy, Medal } from 'lucide-react';

/* ===== Tipos para las cards ===== */
type ReportResumenDTO = {
  clasificados: number;
  oro: number;
  plata: number;
  bronce: number;
  menciones: number;
  totalPremiados: number;
};

/* ===== API helper para las cards ===== */
async function getResumenClasificados(): Promise<ReportResumenDTO> {
  const { data } = await api.get<ReportResumenDTO>('/reportes/clasificados/resumen');
  return data;
}

/* ===== UI: Card métrica (igual a Responsables) ===== */
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
    <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="text-black text-2xl">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-black">{value}</p>
    </div>
  );
}

/* ===== UI: Segmented Tabs ===== */
type TabKey = 'Clasificados' | 'Premiados' | 'Certificados' | 'Ceremonia' | 'Publicación';

function SegmentedTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange?: (tab: TabKey) => void;
}) {
  const tabs: TabKey[] = ['Clasificados', 'Premiados', 'Certificados', 'Ceremonia', 'Publicación'];
  return (
    <div role="tablist" aria-label="Secciones de reportes" className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
      {tabs.map((t) => {
        const isActive = t === active;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              'px-3 py-1 text-sm rounded-full transition',
              isActive ? 'bg-white text-black shadow' : 'text-gray-600 hover:bg-white hover:text-black',
            ].join(' ')}
            onClick={() => onChange?.(t)}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

/* ===== Carga perezosa de cada tab (carpeta "tabs") ===== */
const ClasificadosTab = dynamic(() => import('./tabs/clasificados'), { ssr: false });
const PremiadosTab   = dynamic(() => import('./tabs/premiados'),   { ssr: false });
const CertificadosTab= dynamic(() => import('./tabs/certificados'), { ssr: false });
const CeremoniaTab   = dynamic(() => import('./tabs/ceremonia'),   { ssr: false });
const PublicacionTab = dynamic(() => import('./tabs/publicacion'), { ssr: false });

/* ===== Página ===== */
export default function ReportesPage() {
  const { setTitle } = usePageHeader();
  useEffect(() => { setTitle('Reportes'); }, [setTitle]);

  const [active, setActive] = useState<TabKey>('Clasificados');

  // Cards (totales)
  const [resumen, setResumen] = useState<ReportResumenDTO | null>(null);
  useEffect(() => {
    getResumenClasificados()
      .then((r) => setResumen(r))
      .catch(() =>
        setResumen({ clasificados: 0, oro: 0, plata: 0, bronce: 0, menciones: 0, totalPremiados: 0 })
      );
  }, []);

  const cards = useMemo(
    () => [
      { key: 'clasificados', label: 'Clasificados', value: resumen?.clasificados ?? 0, icon: <Users /> },
      { key: 'oro',          label: 'Oro',          value: resumen?.oro ?? 0,          icon: <Trophy /> },
      { key: 'plata',        label: 'Plata',        value: resumen?.plata ?? 0,        icon: <Medal /> },
      { key: 'bronce',       label: 'Bronce',       value: resumen?.bronce ?? 0,       icon: <Medal /> },
      { key: 'menciones',    label: 'Menciones',    value: resumen?.menciones ?? 0,    icon: <Medal /> },
      { key: 'total',        label: 'Total Premiados', value: resumen?.totalPremiados ?? 0, icon: <Users /> },
    ],
    [resumen]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-black">Sistema de Reportes</h1>
        <p className="text-gray-500 text-sm">Generación de listas y documentos para clasificados y premiados</p>
      </div>

      {/* Tabs */}
      <div>
        <SegmentedTabs active={active} onChange={setActive} />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {cards.map((c) => (
          <CardMetric key={c.key} label={c.label} value={c.value} icon={<div className="w-6 h-6">{c.icon}</div>} />
        ))}
      </div>

      {/* Contenido del tab */}
      {active === 'Clasificados' && <ClasificadosTab />}
      {active === 'Premiados' && <PremiadosTab />}
      {active === 'Certificados' && <CertificadosTab />}
      {active === 'Ceremonia' && <CeremoniaTab />}
      {active === 'Publicación' && <PublicacionTab />}
    </div>
  );
}
