// src/app/private/olimpistas/page.tsx
'use client';
import { useEffect } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';

export default function RegistroActividadesPage() {
  const { setTitle } = usePageHeader();

  useEffect(() => {
    setTitle('Registro de Actividades');
  }, [setTitle]);
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Listado de Registro de Actividades</h2>
      <p className="text-gray-700">Aquí va el contenido de la sección.</p>
    </div>
  );
}
