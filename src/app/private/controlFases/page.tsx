// src/app/private/controlFases/page.tsx
'use client';
import { useEffect} from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
export default function ControlFasesPage() {
  const { setTitle } = usePageHeader();
  useEffect(() => {
      setTitle('Control de Fases');
    }, [setTitle]);
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Listado de Control de fases</h2>
      <p className="text-gray-700">Aquí va el contenido de la sección.</p>
    </div>
  );
}
