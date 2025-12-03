// src/app/private/configuracion/password/page.tsx
'use client';

import { Suspense, useEffect } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import PasswordTab from '../tabs/PasswordTab';

function PasswordOnlyContent() {
  const { setTitle } = usePageHeader();

  useEffect(() => {
    // Título que se ve arriba, igual que en Configuración
    setTitle('Configuración del Sistema');
  }, [setTitle]);

  return (
    <div className="p-1 space-y-6 text-gray-900">
      <div className="bg-[var(--fondoAzulGris)] border-gray-100 min-h-[400px] p-4 flex flex-col gap-6">
        {/* Encabezado de esta vista */}
        <div>
          <h2 className="text-2xl font-bold text-black">Cambiar contraseña</h2>
          <p className="text-gray-500 text-sm">
            Actualiza tu contraseña de acceso al sistema.
          </p>
        </div>

        {/* Reutilizamos exactamente el mismo formulario */}
        <PasswordTab />
      </div>
    </div>
  );
}

export default function PasswordOnlyPage() {
  return (
    <Suspense fallback={<div className="p-4">Cargando...</div>}>
      <PasswordOnlyContent />
    </Suspense>
  );
}
