'use client'; // ← asegúrate de tenerlo

import { useState } from 'react'; // ← FALTA este import
import Cards from '@/components/features/RegistroEva/components/Cards';
import Search from '@/components/features/RegistroEva/components/Search';
import Table from '@/components/features/RegistroEva/components/Table';
// Usa import **default** (sin llaves) porque tu hook exporta default
import useEvaluadores from '@/components/features/RegistroEva/hooks/useEvaluadores';

export default function EvaluadoresPage() {
  const { q, setQ, loading, evaluadores, metrics /*, refetch */ } = useEvaluadores();
  const [show, setShow] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <Cards
        total={metrics.total}
        activos={metrics.activos}             // ← nueva métrica
        areasCubiertas={metrics.areasCubiertas}
        promExp={metrics.promExp}
        onAdd={() => setShow(true)}           // ← booleano
      />

      <Search value={q} onChange={setQ} />

      <Table loading={loading} evaluadores={evaluadores} />

      {/* {show && (
        <AddEvaluatorModal
          onClose={() => setShow(false)}
          onSuccess={() => { setShow(false); refetch(); }}
        />
      )} */}
    </div>
  );
}
