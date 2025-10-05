'use client';

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import TableEvaluadores from './TableEvaluadores';

export default function PageEvaluadores() {
  const [evaluadores, setEvaluadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchEvaluadores() {
    setLoading(true);
    try {
      // Ajusta si tu backend expone /api/v1
      const { data } = await api.get('/evaluadores'); 
      setEvaluadores(data);
    } catch (e) {
      console.error(e);
      alert('Error al cargar los evaluadores');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvaluadores();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Evaluadores</h1>
        <p className="text-gray-500 text-sm">Administración de evaluadores por área</p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center">Cargando evaluadores...</p>
      ) : (
        <TableEvaluadores evaluadores={evaluadores} />
      )}
    </div>
  );
}
