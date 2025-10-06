'use client';
import { useState } from 'react';
import Cards from '@/components/features/RegistroEva/components/Cards';
import Search from '@/components/features/RegistroEva/components/Search';
import Table from '@/components/features/RegistroEva/components/Table';
import useEvaluadores from '@/components/features/RegistroEva/hooks/useEvaluadores';
import AddEvaluatorModal from '@/components/features/RegistroEva/components/AddEvaluatorModal'; // <-- NUEVO

export default function EvaluadoresPage() {
  const { q, setQ, loading, evaluadores, metrics, refetch } = useEvaluadores();
  const [show, setShow] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <Cards
        total={metrics.total}
        activos={metrics.activos}
        areasCubiertas={metrics.areasCubiertas}
        promExp={metrics.promExp}
        onAdd={() => setShow(true)}
      />

      <Search value={q} onChange={setQ} />

      <Table loading={loading} evaluadores={evaluadores} />

      {show && (
        <AddEvaluatorModal
          onClose={() => setShow(false)}
          onSuccess={() => { setShow(false); refetch(); }}
        />
      )}
    </div>
  );
}
