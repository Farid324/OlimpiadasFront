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